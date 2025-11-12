import { User } from '../../shared/types/user';
import prismaClient from '../prismaClient';
import { users as PrismaUser } from '@prisma/client';

function toAppUser(user: PrismaUser): User {
  return {
    name: user.name ?? '',
    email: user.email ?? '',
    birthDate: user.birth_date ?? new Date(),
    phone: user.phone ?? '',
    address: {
      street: user.street ?? '',
      postalCode: user.postal_code ?? '',
      city: user.city ?? '',
    },
    profilePicture: user.profile_picture ?? '',
    studyPlace: user.place_of_education ?? '',
    study: user.study_program ?? 'annet',
    seniority: user.seniority ?? 0,
    roomNumber: user.room_number ?? 0,
    onLeave: user.on_leave ?? false,
    isActive: user.is_active ?? true,
    createdAt: user.created_at,
    role: 'Halv/Halv', // Note: Role mapping might be needed
  };
}

export async function addUser(uid: string, data: User): Promise<string | undefined> {
  try {
    await prismaClient.users.create({
      data: {
        id: uid,
        name: data.name,
        email: data.email,
        birth_date: data.birthDate,
        phone: data.phone,
        street: data.address.street,
        postal_code: data.address.postalCode,
        city: data.address.city,
        place_of_education: data.studyPlace,
        profile_picture: data.profilePicture,
        study_program: data.study,
        seniority: data.seniority,
        room_number: data.roomNumber,
        on_leave: data.onLeave,
        is_active: data.isActive,
        created_at: data.createdAt,
      },
    });
    return uid;
  } catch (error: unknown) {
    console.error(error);
    throw new Error('kunne ikke legge til beboer');
  }
}

export async function getUser(uid: string): Promise<User | undefined> {
  try {
    const user = await prismaClient.users.findUnique({ where: { id: uid } });
    if (user) {
      return toAppUser(user);
    }
    return undefined;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  try {
    const {
      birthDate,
      isActive,
      onLeave,
      roomNumber,
      studyPlace,
      profilePicture,
      study,
      address,
      ...rest
    } = data;
    await prismaClient.users.update({
      where: { id: uid },
      data: {
        ...rest,
        birth_date: birthDate,
        is_active: isActive,
        on_leave: onLeave,
        room_number: roomNumber,
        place_of_education: studyPlace,
        study_program: study,
        profile_picture: profilePicture,
        street: address?.street,
        postal_code: address?.postalCode,
        city: address?.city,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    throw new Error('kunne ikke oppdatere beboer');
  }
}
