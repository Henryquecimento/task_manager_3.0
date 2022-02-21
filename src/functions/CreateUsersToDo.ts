import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamoClient";
import { v4 as uuid } from "uuid";

interface ICreateUserToDo {
  title: string;
  deadline: Date;
}

interface ITemplate {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  deadline: Date;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters;
  const { title, deadline } = JSON.parse(event.body) as ICreateUserToDo;

  const id = uuid();

  await document
    .put({
      TableName: "user_todos",
      Item: {
        id,
        user_id,
        title,
        done: false,
        deadline: new Date(deadline).getTime(),
      },
    })
    .promise();

  const response = await document
    .query({
      TableName: "user_todos",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id,
      },
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify(response.Items[0] as ITemplate),
  };
};
