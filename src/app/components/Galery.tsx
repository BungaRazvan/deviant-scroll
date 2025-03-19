"use client";

import React, { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Artwork from "./Artwork";
import { Input } from "@/components/ui/input";

const Galery = (props) => {
  const { accessToken, deviantUser } = props;

  const [items, setItems] = useState([]);

  const [displayAll, setDisplayAll] = useState(false);
  const [folder, setFolder] = useState(null);
  const [offset, setOffset] = useState(0);
  const [startOffset, setStartOffset] = useState(0);

  const [subFolders, setSubFolders] = useState([]);
  const [filteredSubFolders, setFilteredSubFolders] = useState([]);

  const filterFolders = (e) => {
    if (!e.target.value) {
      setFilteredSubFolders(subFolders);
      return;
    }

    const filteredFolders = subFolders.filter((folder) =>
      folder.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredSubFolders(filteredFolders);
  };

  useEffect(() => {
    fetchItems();
  }, [accessToken]);

  const fetchItems = async () => {
    const response = await fetch(
      `/api/proxy?username=${deviantUser}&offset=${offset}`
    );
    const data = await response.json();
    const results = data.results || [];
    setItems(results);
    setOffset(data.next_offset);
  };

  const onClick = (item) => {
    setDisplayAll(false);

    if (item.has_subfolders) {
      setSubFolders(item.subfolders);
      setFilteredSubFolders(item.subfolders);
      return;
    }

    setSubFolders([]);
    setFolder(item.folderid);
  };

  return (
    <div className="text-white container">
      <div className="row">
        <h1 className="text-3xl font-bold text-center mb-6">Galery</h1>
      </div>

      <div className="row">
        <Carousel>
          <CarouselContent>
            <CarouselItem
              onClick={() => {
                setDisplayAll((prev) => !prev);
              }}
              className="basis-1/3"
            >
              <div className="items-center flex flex-col">
                {items.length > 0 && (
                  <>
                    <img
                      src={items[0].thumb?.content?.src}
                      className="h-[125px] object-cover"
                    />
                    <span className="text-1xl font-bold text-center  text-clip">
                      All
                    </span>
                  </>
                )}
              </div>
            </CarouselItem>
            {items.map((item, index) => (
              <CarouselItem
                onClick={() => onClick(item)}
                key={item.name}
                className="basis-1/3"
              >
                <div className="items-center flex flex-col">
                  <img
                    src={item.thumb?.content?.src}
                    className="h-[125px] object-cover"
                  />
                  <span className="text-1xl font-bold text-center  text-clip">
                    {item.name}
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      {subFolders.length > 0 && !displayAll && (
        <>
          <Input
            type="email"
            onChange={filterFolders}
            placeholder="Filter Folders"
            className="m-5"
          />

          <Carousel>
            <CarouselContent>
              {filteredSubFolders.map((item, index) => (
                <CarouselItem
                  onClick={() => setFolder(item.folderid)}
                  key={item.folderid}
                  className="basis-1/3"
                >
                  <div className="items-center flex flex-col">
                    <img
                      src={item.thumb?.content?.src}
                      className="h-[125px] object-cover"
                    />
                    <span className="text-1xl font-bold text-center  text-clip">
                      {item.name}
                    </span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </>
      )}

      {displayAll ? (
        <>
          <Input
            type="number"
            onBlur={(e) => setStartOffset(Number(e.target.value))}
          />
          <Artwork
            folder={null}
            accessToken={accessToken}
            deviantUser={deviantUser}
            startOffset={startOffset}
          />
        </>
      ) : (
        <>
          {folder && (
            <Artwork
              folder={folder}
              accessToken={accessToken}
              deviantUser={deviantUser}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Galery;
