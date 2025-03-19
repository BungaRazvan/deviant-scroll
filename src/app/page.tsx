"use client";

import React, { useEffect, useState, useRef } from "react";

import { useSession, signIn, signOut } from "next-auth/react";
import Galery from "./components/Galery";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { data: session } = useSession();
  const [deviantUser, setDeviantUser] = useState<string>("");
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const lsUser = localStorage.getItem("deviantUser");

    if (lsUser) {
      setDeviantUser(lsUser!);
      setQuery(lsUser!);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDeviantUser(e.target.value);
      localStorage.setItem("deviantUser", e.target.value);
    }, 1000);
  };

  return (
    <>
      {session ? (
        <div className="flex justify-center min-h-screen">
          <div className="text-center">
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => signOut()}
            >
              Logout
            </button>
            <button></button>

            <Input
              className="m-5"
              placeholder="Type user"
              value={query}
              onChange={handleChange}
            />

            {deviantUser && (
              <Galery
                // @ts-ignore
                accessToken={session.accessToken}
                deviantUser={deviantUser}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => signIn("deviantart")}
          >
            Login with DeviantArt
          </button>
        </div>
      )}
    </>
  );
}
