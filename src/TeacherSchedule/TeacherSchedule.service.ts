import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, TeacherSchedule } from '@prisma/client';

@Injectable()
export class TeacherScheduleService {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.TeacherScheduleCreateInput) {
    const checkDate = await this.prisma.class.findMany({
      where: {
        name: data.class.connect.name,
        TeacherSchedule: {
          some: {
            nameDate: data.nameDate,
            time: data.time,
            yearName: data.Year.connect.name,
          },
        },
      },
    });
    console.log(checkDate);
    if (checkDate.length > 0) {
      return { isEror: true, mmessage: 'Lớp học này đã được chọn' };
    }
    const checkTeacher = await this.prisma.account.findUnique({
      where: {
        userName: data.account.connect.userName,
      },
      select: {
        permissionCode: true,
        subjectTeacherName: true,
      },
    });

    if (checkTeacher.permissionCode == 'hs') {
      return { message: 'Tài Khoản Không Là Giáo Vien' };
    } else if (
      data.Subject.connect.name.includes(checkTeacher.subjectTeacherName) !==
      true
    ) {
      return { message: 'Giáo Viên Không Thuộc Bộ Môn' };
    } else {
      return await this.prisma.teacherSchedule.create({
        data,
      });
    }
  }
  async getByTeacher(params: { userName?: string; yearName?: string }) {
    let {userName , yearName } = params;

    if (yearName == 'undefined') {
      const year = await this.prisma.year.findMany({
        where: { isActive: true },
        orderBy: { name: 'desc' },
        take: 1,
      });
      yearName = year[0].name;
    }
    console.log(yearName);
    return await this.prisma.teacherSchedule.findMany({
      where: {
        accountName: userName,
        yearName: yearName,
      },
    });
  }
  async getClassByShedule(params: { userName?: string; yearName?: string }){
    let {userName , yearName } = params;

    if (yearName == 'undefined') {
      const year = await this.prisma.year.findMany({
        where: { isActive: true },
        orderBy: { name: 'desc' },
        take: 1,
      });
      yearName = year[0].name;
    }
    console.log(yearName);
    const data = await this.prisma.teacherSchedule.findMany({
      where: {
        accountName: userName,
        yearName: yearName,
      },
    });
    let uniqueData = data.filter((item, index, self) =>
            index === self.findIndex((t) => (
                t.className === item.className
            ))
    );
    return uniqueData;
  }
  async update(params: {
    data;
    where: Prisma.TeacherScheduleWhereUniqueInput;
  }) {
    const { data, where } = params;
    const subjectName = params.data.subjectName;
   
    const CheckTime = await this.prisma.teacherSchedule.findMany({
      where: {
        className:data.className,
        nameDate: data.nameDate,
        time: data.time,
        yearName: data.yearName

      },
    });
    console.log('checkTime',CheckTime);
    if (CheckTime.length > 0) {
      return { isEror: true, mmessage: 'Tiết học này đã tồn tại ' };
    }
    const checkDate = await this.prisma.class.findMany({
      where: {
        name: data.userName,
        TeacherSchedule: {
          some: {
            nameDate: data.nameDate,
            subjectName:data.subjectName,
            time: data.time,
            yearName: data.yearName,
          },
        },
      },
    });
    console.log('checkDate',checkDate);
    if (checkDate.length > 0) {
      return { isEror: true, mmessage: 'Lớp học này đã được chọn' };
    }
    const classCheck = data.className.slice(0,1)
    
    const checkSubject = await this.prisma.subject.findMany({
      where: {
        Khoi:classCheck
        
      },
    });
    const foundSubject = checkSubject.find(person => person.name.includes(data.subjectName));
console.log(foundSubject)
    if (!foundSubject) {
      return { isEror: true, mmessage: 'Môn Học Không Tồn Tại' };
    }
    if (where.id == 'undefined') {
      console.log(data);
      const createShedule = await this.prisma.teacherSchedule.createMany({
        data,
      });
      return createShedule;
    } else {
      const sheduleUpdate = await this.prisma.teacherSchedule.update({
        where,
        data,
      });
      return sheduleUpdate;
    }
  }
  async Delete() {
    return await this.prisma.teacherSchedule.deleteMany();
  }
}
