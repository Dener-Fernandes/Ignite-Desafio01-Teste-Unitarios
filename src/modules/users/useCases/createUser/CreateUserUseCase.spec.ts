import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Create User UseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "userTes@gmail.com",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user with an existing email", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User test",
        email: "userTes@gmail.com",
        password: "1234",
      });

      const user2 = await createUserUseCase.execute({
        name: "User test",
        email: "userTes@gmail.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
