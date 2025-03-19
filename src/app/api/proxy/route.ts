import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const session = await getServerSession(authOptions);

  const username = searchParams.get("username");
  const offset = searchParams.get("offset");

  // @ts-ignore
  const access_token = session.accessToken;

  try {
    const response = await fetch(
      `https://www.deviantart.com/api/v1/oauth2/gallery/folders/?username=${username}&offset=${offset}&mature_content=true`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: response.status,
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
