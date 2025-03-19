import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const session = await getServerSession(authOptions);

  // @ts-ignore
  const access_token = session.accessToken;

  const folder = searchParams.get("folder");
  const username = searchParams.get("username");
  const offset = searchParams.get("offset");

  let url = `https://www.deviantart.com/api/v1/oauth2/gallery/${folder}?&username=${username}&offset=${offset}&with_session=false&mature_content=true`;

  if (!folder) {
    url = `https://www.deviantart.com/api/v1/oauth2/gallery/all/?&username=${username}&offset=${offset}&with_session=false&mature_content=true`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify(response.json()), {
        status: response.status,
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
    });
  }
}
