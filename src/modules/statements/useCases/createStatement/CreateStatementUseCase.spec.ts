import { Connection, createConnection } from "typeorm";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let user: User;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: StatementsRepository;
let createUserUseCase: CreateUserUseCase;
let connection: Connection;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement UseCase", () => {

  beforeAll(async () => {

    connection = await createConnection();

    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new StatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    createUserUseCase = new CreateUserUseCase(usersRepository);

    await connection.createQueryRunner().dropTable("statements", true);
    await connection.createQueryRunner().dropTable("users", true);
    await connection.createQueryRunner().dropTable("migrations", true);
    await connection.runMigrations();
  });

  afterAll(() => {
    connection.close();
  });

  it("should be able to make a deposit", async () => {
    user = await createUserUseCase.execute({
      name: "User test",
      email: "userTes@gmail.com",
      password: "1234",
    });

    const result = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: "deposit" as OperationType,
      amount: 10,
      description: "Test description",
    });

    expect(result).toHaveProperty("id");
  });

  it("should be able to make a withdraw", async () => {
    await createStatementUseCase.execute({
      user_id: String(user.id),
      type: "deposit" as OperationType,
      amount: 100,
      description: "Test description",
    });

    const result = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: "withdraw" as OperationType,
      amount: 30,
      description: "Test description",
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able to make a withdrawal operation when the amount is greater than the balance", async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: "deposit" as OperationType,
        amount: 100,
        description: "Test description",
      });

      const result = await createStatementUseCase.execute({
        user_id: String(user.id),
        type: "withdraw" as OperationType,
        amount: 200,
        description: "Test description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("Should not be able to make a deposit with a non existing user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "123456789",
        amount: 40,
        description: "rent",
        type: "deposit" as OperationType,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to make a withdraw with a non existing user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "12346789",
        amount: 40,
        description: "rent",
        type: "withdraw" as OperationType,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
