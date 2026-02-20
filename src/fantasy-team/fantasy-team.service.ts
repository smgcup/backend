import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { FantasyTeam } from './entities/fantasy-team.entity';
import { FantasyTeamSlot } from './entities/fantasy-team-slot.entity';
import { FantasyPlayer } from '../fantasy-player/entities/fantasy-player.entity';
import { SaveFantasyTeamDto } from './dto/save-fantasy-team.dto';
import { BadRequestError, InternalServerError } from '../exception/exceptions';
import { FANTASY_TEAM_TRANSLATION_CODES } from '../exception/translation-codes/fantasy-team.translation-codes';
import { generateUuidv7 } from '../shared/utils';
import { PlayerPosition } from '../player/enums/player-position.enum';

const VALID_FORMATIONS: [number, number, number][] = [
  [3, 1, 1],
  [2, 2, 1],
  [2, 1, 2],
];

const TOTAL_SLOTS = 9;
const FIELD_SLOTS = 6;
const BENCH_SLOTS = 3;

@Injectable()
export class FantasyTeamService {
  private readonly logger = new Logger(FantasyTeamService.name);

  constructor(
    @InjectRepository(FantasyTeam)
    private readonly fantasyTeamRepository: Repository<FantasyTeam>,
    @InjectRepository(FantasyTeamSlot)
    private readonly fantasyTeamSlotRepository: Repository<FantasyTeamSlot>,
    @InjectRepository(FantasyPlayer)
    private readonly fantasyPlayerRepository: Repository<FantasyPlayer>,
    private readonly dataSource: DataSource,
  ) {}

  async getFantasyTeamByUserId(userId: string): Promise<FantasyTeam | null> {
    return await this.fantasyTeamRepository.findOne({
      where: { userId },
      relations: {
        user: true,
        captainPlayer: { player: { team: true } },
        slots: { fantasyPlayer: { player: { team: true } } },
      },
    });
  }

  async saveFantasyTeam(userId: string, dto: SaveFantasyTeamDto): Promise<FantasyTeam> {
    this.validateSlotCounts(dto);

    const playerIds = dto.slots.map((s) => s.playerId);
    this.validateNoDuplicates(playerIds);

    const fantasyPlayers = await this.fantasyPlayerRepository.find({
      where: { playerId: In(playerIds) },
      relations: { player: true },
    });

    if (fantasyPlayers.length !== playerIds.length) {
      throw new BadRequestError(FANTASY_TEAM_TRANSLATION_CODES.playerNotFound);
    }

    const playerMap = new Map(fantasyPlayers.map((fp) => [fp.playerId, fp]));
    this.validateFormation(dto, playerMap);

    if (!playerIds.includes(dto.captainPlayerId)) {
      throw new BadRequestError(FANTASY_TEAM_TRANSLATION_CODES.invalidCaptain);
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        let team = await manager.findOne(FantasyTeam, { where: { userId } });

        if (team) {
          team.teamName = dto.teamName;
          team.budget = dto.budget;
          team.freeTransfers = dto.freeTransfers;
          team.captainPlayerId = dto.captainPlayerId;
          await manager.save(FantasyTeam, team);
          await manager.delete(FantasyTeamSlot, { fantasyTeamId: team.id });
        } else {
          team = manager.create(FantasyTeam, {
            id: generateUuidv7(),
            userId,
            teamName: dto.teamName,
            budget: dto.budget,
            freeTransfers: dto.freeTransfers,
            captainPlayerId: dto.captainPlayerId,
          });
          await manager.save(FantasyTeam, team);
        }

        const slots = dto.slots.map((slotDto) =>
          manager.create(FantasyTeamSlot, {
            id: generateUuidv7(),
            fantasyTeamId: team.id,
            playerId: slotDto.playerId,
            isBenched: slotDto.isBenched,
            slotOrder: slotDto.slotOrder,
          }),
        );

        await manager.save(FantasyTeamSlot, slots);

        return await manager.findOneOrFail(FantasyTeam, {
          where: { id: team.id },
          relations: {
            user: true,
            captainPlayer: { player: { team: true } },
            slots: { fantasyPlayer: { player: { team: true } } },
          },
        });
      });
    } catch (error: unknown) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Error saving fantasy team: ${(error as Error).message}`);
      throw new InternalServerError(FANTASY_TEAM_TRANSLATION_CODES.fantasyTeamSaveFailed);
    }
  }

  private validateSlotCounts(dto: SaveFantasyTeamDto): void {
    const fieldSlots = dto.slots.filter((s) => !s.isBenched);
    const benchSlots = dto.slots.filter((s) => s.isBenched);

    if (dto.slots.length !== TOTAL_SLOTS || fieldSlots.length !== FIELD_SLOTS || benchSlots.length !== BENCH_SLOTS) {
      throw new BadRequestError(FANTASY_TEAM_TRANSLATION_CODES.invalidSlotCount);
    }
  }

  private validateNoDuplicates(playerIds: string[]): void {
    if (new Set(playerIds).size !== playerIds.length) {
      throw new BadRequestError(FANTASY_TEAM_TRANSLATION_CODES.duplicatePlayer);
    }
  }

  private validateFormation(dto: SaveFantasyTeamDto, playerMap: Map<string, FantasyPlayer>): void {
    const fieldSlots = dto.slots.filter((s) => !s.isBenched);

    const positionCounts = { gk: 0, def: 0, mid: 0, fwd: 0 };
    for (const slot of fieldSlots) {
      const fp = playerMap.get(slot.playerId)!;
      switch (fp.player.position) {
        case PlayerPosition.GOALKEEPER:
          positionCounts.gk++;
          break;
        case PlayerPosition.DEFENDER:
          positionCounts.def++;
          break;
        case PlayerPosition.MIDFIELDER:
          positionCounts.mid++;
          break;
        case PlayerPosition.FORWARD:
          positionCounts.fwd++;
          break;
      }
    }

    if (positionCounts.gk !== 1) {
      throw new BadRequestError(FANTASY_TEAM_TRANSLATION_CODES.invalidFormation);
    }

    const outfieldFormation: [number, number, number] = [positionCounts.def, positionCounts.mid, positionCounts.fwd];
    const isValid = VALID_FORMATIONS.some(
      (f) => f[0] === outfieldFormation[0] && f[1] === outfieldFormation[1] && f[2] === outfieldFormation[2],
    );

    if (!isValid) {
      throw new BadRequestError(FANTASY_TEAM_TRANSLATION_CODES.invalidFormation);
    }
  }
}
