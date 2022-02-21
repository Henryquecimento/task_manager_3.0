import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "src/utils/dynamoClient";

interface ICreateUserToDo {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  deadline: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id, user_id, title, done, deadline } = JSON.parse(
    event.body
  ) as ICreateUserToDo;

  const response = await document
    .query({
      TableName: "user_todos",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id,
      },
    })
    .promise();

  const toDoAlreadyExists = response.Items[0];

  if (!toDoAlreadyExists) {
    await document
      .put({
        TableName: "user_todos",
        Item: {
          id,
          user_id,
          title,
          done,
          deadline: new Date(deadline),
        },
      })
      .promise();
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "To Do Created",
      toDo: response.Items[0],
    }),
  };
};
