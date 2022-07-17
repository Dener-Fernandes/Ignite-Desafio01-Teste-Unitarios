import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate UserCase", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should be able to authenticate an user", async () => {
    await createUserUseCase.execute({
      name: "User test",
      email: "userTes@gmail.com",
      password: "1234",
    });

    const result = await authenticateUserUseCase.execute({
      email: "userTes@gmail.com",
      password: "1234",
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate a non existing user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "userTes@gmail.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an user with a incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User test",
        email: "userTes@gmail.com",
        password: "1234",
      });

      await authenticateUserUseCase.execute({
        email: "userTes@gmail.com",
        password: "1234567",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
