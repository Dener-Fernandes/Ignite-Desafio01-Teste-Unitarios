import { Connection, createConnection } from "typeorm";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let user: User;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: StatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let connection: Connection;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation UseCase", () => {
  beforeAll(async () => {

    connection = await createConnection();

    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new StatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    createUserUseCase = new CreateUserUseCase(usersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);

    await connection.createQueryRunner().dropTable("statements", true);
    await connection.createQueryRunner().dropTable("users", true);
    await connection.createQueryRunner().dropTable("migrations", true);
    await connection.runMigrations();

  });

  afterAll(() => {
    connection.close();
  });

  it("should be able to get a statement", async () => {
    user = await createUserUseCase.execute({
      name: "User test",
      email: "userTes@gmail.com",
      password: "1234",
    });

    const statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: "deposit" as OperationType,
      amount: 10,
      description: "Test description",
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id),
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able to get a statement of a non existing user", async () => {
    await expect(async () => {
      const statement = await createStatementUseCase.execute({
        user_id: String(user.id),
        type: "deposit" as OperationType,
        amount: 10,
        description: "Test description",
      });

      await getStatementOperationUseCase.execute({
        user_id: "123456",
        statement_id: String(statement.id),
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a non existing statement ", async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: "User test",
        email: "userTes@gmail.com",
        password: "1234",
      });

      const statement = await createStatementUseCase.execute({
        user_id: String(user.id),
        type: "deposit" as OperationType,
        amount: 10,
        description: "Test description",
      });

      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: "1234567",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
});
