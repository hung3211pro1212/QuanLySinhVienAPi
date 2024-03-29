import {Injectable} from '@nestjs/common';
import {Prisma, Score} from '@prisma/client';
import {PrismaService} from 'prisma/prisma.service';

@Injectable()
export class ScoreService {
    constructor(private prisma: PrismaService) {
    }

    async createScore(data: Prisma.ScoreCreateInput) {
        const isCheck = await this.prisma.score.findMany({
            where: {
                accountId: data.Account.connect.userName,
                semester: data.semester,
                yearName: data.Year.connect.name,
                subjectName: data.Subject.connect.name,
            }
        })
        console.log(isCheck.length)
        if (isCheck.length > 0) {
            return {isError: true, message: 'Tiết học này đã tồn tại'};
        }
        return await this.prisma.score.create({
            data,
        });
    }

    async getAlScoreSubject(params: {
        accountId: string;
        hocky: string;
        yearName: string;
    }) {
        let {accountId, hocky, yearName} = params;
        if (yearName == 'undefined' || yearName == '') {
            const year = await this.prisma.year.findMany({
                where: {isActive: true},
                orderBy: {name: 'desc'},
                take: 1,
            });
            yearName = year[0].name;
        }
        console.log(yearName);
        return await this.prisma.score.findMany({
            where: {
                accountId: accountId,
                semester: hocky != '' ? hocky : undefined,
                yearName: yearName,
            },
        });
    }

    async getScore(params: {
        accountId: string;
        hocky: string;
        subjectId: string
        yearName: string;
    }) {
        let {accountId, subjectId, hocky, yearName} = params;
        if (yearName == 'undefined' || yearName == '') {
            const year = await this.prisma.year.findMany({
                where: {isActive: true},
                orderBy: {name: 'desc'},
                take: 1,
            });
            yearName = year[0].name;
        }

        console.log(yearName);
        return await this.prisma.score.findMany({
            where: {
                accountId: accountId,
                Subject: {
                    id: subjectId
                },
                // subjectName: subjectName != ''  ? subjectName:undefined,
                semester: hocky != '' ? hocky : undefined,
                yearName: yearName,
            },
        });
    }

    async createMany(dto) {
        let data = await dto.score.map((el, index) => ({
            Score15m: el.Score15m,
            Score45m: el.Score45m,
            Score60m: el.Score60m,
            semester: el.semester.toString(),
            accountId: el.accountId.toString(),
            yearName: el.yearName,
            subjectName: el.subjectName,
            average: el.average
        }));
        const listScore = await this.prisma.score.findMany({})
        const intersection = listScore.filter(item1 => data.find(item2 => item1.accountId === item2.accountId && item1.yearName === item2.yearName && item1.subjectName === item2.subjectName && item1.semester === item2.semester));
        console.log(intersection)
        if (intersection.length > 0) {
            return {
                isError: true, message: `${intersection.map(el => {
                    return `Điểm Môn học này của mã học sinh ${el.accountId} đã tồn tại `
                })} `
            };
        }

        return await this.prisma.score.createMany({data});
    }

    async Update(
        params: {
            data: Prisma.ScoreUpdateInput,
            where: Prisma.ScoreWhereUniqueInput,
        }
    ): Promise<Score> {
        const {data, where} = params
        return await this.prisma.score.update({
            where,
            data,
        });
    }
}
