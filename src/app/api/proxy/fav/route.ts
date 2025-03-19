import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust the path

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const session = await getServerSession(authOptions);

  const access_token = session.accessToken;
  const deviationid = searchParams.get("id");

  try {
    const response = await fetch(
      "https://www.deviantart.com/api/v1/oauth2/collections/fave",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          deviationid,
        }),
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify(response.json()), {
        status: response.status,
      });
    }

    return new Response(JSON.stringify(response.json()), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
    });
  }
}
