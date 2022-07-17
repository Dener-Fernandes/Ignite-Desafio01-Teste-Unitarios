import { Connection, createConnection } from "typeorm";
import { User } from "../../../users/entities/User";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let user: User;
let usersRepository: UsersRepository;
let statementsRepository: StatementsRepository;

let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let connection: Connection;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance UseCase", () => {
  beforeAll(async () => {
    connection = await createConnection();

    usersRepository = new UsersRepository();
    statementsRepository = new StatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository,statementsRepository);

    await connection.createQueryRunner().dropTable("statements", true);
    await connection.createQueryRunner().dropTable("users", true);
    await connection.createQueryRunner().dropTable("migrations", true);
    await connection.runMigrations();
  });

  afterAll(() => {
    connection.close();
  });

  it("Should be able to get a user balance", async () => {
    user = await createUserUseCase.execute({
      name: "User test",
      email: "userTes@gmail.com",
      password: "1234",
    });

    await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 50,
      description: "rent",
      type: "deposit" as OperationType,
    });

    await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 40,
      description: "rent",
      type: "withdraw" as OperationType,
    });

    const response = await getBalanceUseCase.execute({
      user_id: String(user.id),
    });

    expect(response).toHaveProperty("balance");
  });

  it("Should not be able to get a non existing user balance", async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: "555555",
      })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
