import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Show User Profile UseCase", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able load an user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "userTes@gmail.com",
      password: "1234",
    });

    const result = await showUserProfileUseCase.execute(String(user.id))

    expect(result).toBeInstanceOf(User);
  });

  it("should not be able to load a non existing user profile", async() => {
    expect(async () => {
      await showUserProfileUseCase.execute(String("123456"));
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
