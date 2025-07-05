"use client";

import React, { useEffect, useState, useRef } from "react";
import { LoadingSpinner } from "./Spinner";
import { Heart } from "lucide-react";

interface ArtworkProps {
  accessToken: string;
  folder?: string;
  deviantUser: string;
  startOffset?: number;
}

const Artwork: React.FC<ArtworkProps> = (props) => {
  const { folder, deviantUser, startOffset } = props;

  const [items, setItems] = useState<
    Array<{
      preview: {
        src: string;
      };
    }>
  >([]);
  const loader = useRef(null);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState(1);

  const imageRefs = useRef([]);
  const lastImageRef = useRef(null);
  const fetchInProgress = useRef(false);

  const favArt = async (item) => {
    fetch(`/api/proxy/fav?id=${item.deviationid}`);
  };

  const fetchItems = async (reset, startOffset = null) => {
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;

    const _offset = startOffset != null ? startOffset : offset;
    const response = await fetch(
      `/api/proxy/folder?offset=${_offset}&folder=${folder}&username=${deviantUser}`
    );
    const data = await response.json();

    const results = data.results || [];

    if (reset) {
      setItems(results);
      scrollToImage(0);
    } else {
      setItems((prevItems) => [...prevItems, ...results]);
    }

    setOffset(data.next_offset);
    setHasMore(data.has_more);

    fetchInProgress.current = false;
  };

  useEffect(() => {
    if (startOffset) {
      setItems([]);
      setImageIndex(0);
      fetchItems(true, startOffset);
    }
  }, [startOffset]);

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setImageIndex(0);
    fetchItems(true, 0);
    scrollToImage(0);
  }, [folder]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchItems(false);
        }
      },
      { threshold: 1 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    if (lastImageRef.current) {
      observer.observe(lastImageRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, offset]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const index = Number(visible.target.getAttribute("data-index"));
          setImageIndex(index + 1);
        }
      },
      {
        threshold: 1,
      }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToImage = (index) => {
    imageRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    setImageIndex(index + 1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScroll = (index) => {
    if (loading) {
      return;
    } // Don't scroll while loading

    if (index === items.length) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          scrollToImage(index);
        });
      }, 800); // Wait for images to load before scrolling
    } else {
      scrollToImage(index);
    }
  };

  const handleFullscreen = (element: any) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen(); // Safari
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen(); // IE11
    }
  };

  return (
    <div className="min-h-screen  text-white p-4">
      <div className="grid gap-5">
        {items.map((item, index) => (
          // @ts-ignore
          <div key={item.deviationid}>
            <div
              ref={(el) => {
                imageRefs.current[index] = el;
                if (index === items.length - 3) {
                  lastImageRef.current = el;
                }
              }}
              data-index={index}
              className="relative rounded-lg overflow-hidden shadow-lg"
            >
              <button
                onClick={() => favArt(item)}
                className="absolute bottom-2  z-10 rounded left-0 p-2 bg-black/100 rounded-full"
              >
                <Heart />
              </button>

              {index > 0 && (
                <button
                  className="absolute top-2 left-0 w-full bg-black/0 p-2 btn-arrow-up"
                  onClick={() => handleScroll(index - 1)}
                ></button>
              )}

              <img
                // @ts-ignore
                src={item.content.src}
                className="w-full h-auto object-cover transition-opacity duration-500 opacity-0"
                onLoad={(e) => {
                  // @ts-ignore
                  e.target.style.opacity = 1;
                }}
                onError={(e) => {
                  // @ts-ignore
                  console.error("Image failed to load:", e.target.src);
                  console.log(item);
                  console.log(e);
                }}
                // onClick={(e) => handleFullscreen(e.target)}
                loading="lazy"
              />

              {index !== items.length - 1 && (
                <button
                  className="absolute bottom-1 left-0 w-full bg-black/0 p-2 btn-arrow-down"
                  onClick={() => handleScroll(index + 1)}
                ></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 bg-black/50 text-gray-300 p-2 pt-1 rounded-full shadow-lg transition-opacity duration-300"
        >
          ▲
        </button>
      )}

      {items.length > 0 && (
        <span className="fixed bottom-5 left-5 bg-black/50 rounded-full p-2">
          {imageIndex} / {items.length}
        </span>
      )}

      {hasMore && fetchInProgress && (
        <div ref={loader} className="flex justify-center p-4 text-gray-400">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default Artwork;
