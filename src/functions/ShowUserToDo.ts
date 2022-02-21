import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamoClient";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters;

  const response = await document
    .scan({
      TableName: "user_todos",
      FilterExpression: ":user_id = user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    })
    .promise();

  const userToDo = response.Items;

  if (userToDo.length != 0) {
    return {
      statusCode: 200,
      body: JSON.stringify(userToDo),
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "There is no To Dos for this user",
    }),
  };
};
