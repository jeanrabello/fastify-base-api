import CustomError from "@src/shared/classes/CustomError";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { IUserRepository } from "../types/IUserRepository";
import { IUserTranslation } from "../types/IUserTranslation";
import { UpdateUserEmailResponseModel } from "../models/Response/UpdateUserEmailResponse.model";

interface IUpdateUserEmailUseCase {
  userRepository: IUserRepository;
}

export class UpdateUserEmailUseCase implements IUseCase {
  private userRepository: IUserRepository;

  constructor({ userRepository }: IUpdateUserEmailUseCase) {
    this.userRepository = userRepository;
  }

  async execute({
    userId,
    email,
    currentUserId,
  }: Partial<{
    userId: string;
    email: string;
    currentUserId: string;
  }>): Promise<UpdateUserEmailResponseModel> {
    if (!userId || !email) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    // Authorization: only the owner can update their email
    if (currentUserId && currentUserId !== userId) {
      throw new CustomError("shared.error.accessForbidden", 403);
    }

    const userFoundById = await this.userRepository.findById(userId);
    const userFoundByEmail = await this.userRepository.findByEmail(email);

    if (!userFoundById) {
      throw new CustomError<IUserTranslation>(
        "user.updateUserEmail.notFound",
        404,
      );
    }

    if (userFoundByEmail && userFoundByEmail.id !== userId) {
      throw new CustomError<IUserTranslation>(
        "user.updateUserEmail.emailAlreadyRegistered",
        409,
      );
    }

    const updatedUser = await this.userRepository.updateUserEmail(
      userId,
      email,
    );

    if (!updatedUser) {
      throw new CustomError<IUserTranslation>(
        "user.updateUserEmail.error",
        500,
      );
    }

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
    } as UpdateUserEmailResponseModel;
  }
}
