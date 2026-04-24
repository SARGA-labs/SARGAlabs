

"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import Masonry from "react-masonry-css";
import { useWindowSize } from "~/hooks/use-window-size";
import { Container } from "../common/container";
import s from "./write.module.scss";
import ErrorBoundary from "../common/errors/ErrorBoundary";
import SkeletonLoader from "../common/SkeletonLoader";
import { NewsletterModal } from "../common/NewsletterModal";
import { NewsletterStatic } from "../common/NewsletterModal/Static";

const breakpointColumns = {
  default: 6,
  1100: 4,
  700: 2,
  500: 1,
};

export const ShapeSpacer = ({
  side,
  radius,
}: {
  side: "left" | "right";
  radius: number;
}) => {
  const spacerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const updateShape = useCallback(() => {
    if (!spacerRef.current) return;
    const rect = spacerRef.current.getBoundingClientRect();
    // Only update if the spacer is actually near the viewport to save performance
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const viewportHeight = window.innerHeight;
    const relativeY = viewportHeight / 2 - rect.top;

    if (side === "left") {
      spacerRef.current.style.shapeOutside = `circle(${radius}px at 100% ${relativeY}px)`;
      spacerRef.current.style.width = `${radius}px`;
    } else {
      spacerRef.current.style.shapeOutside = `circle(${radius}px at 0% ${relativeY}px)`;
      spacerRef.current.style.width = `${radius}px`;
    }
  }, [side, radius]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        updateShape();
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    updateShape();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateShape]);

  return (
    <div
      ref={spacerRef}
      className={`${s.shapeSpacer || ""} ${side === "left" ? s.floatRight || "" : s.floatLeft || ""}`}
      style={{ width: radius, height: "100%", minHeight: "100%", zIndex: 10 }}
    />
  );
};

interface MdxItem {
  id: string | number;
  frontmatter: any;
  mdxSource: MDXRemoteSerializeResult;
}

export default function WriteComponent({
  initialItems,
}: {
  initialItems: MdxItem[];
}) {
  const [columns, setColumns] = useState(6);
  const { width } = useWindowSize();
  const [items, setItems] = useState<
    { uniqueId: string; data: MdxItem; originalIndex: number }[]
  >([]);
  const [radius, setRadius] = useState(200);

  // Initialize items directly without chunking
  useEffect(() => {
    if (!initialItems || initialItems.length === 0) return;

    const simpleItems = initialItems.map((item, i) => ({
      uniqueId: `${item.id}`,
      data: item,
      originalIndex: i + 1,
    }));

    setItems(simpleItems);
  }, [initialItems]);

  useEffect(() => {
    if (!width) return;
    if (width <= 500) setColumns(1);
    else if (width <= 700) setColumns(2);
    else if (width <= 1100) setColumns(4);
    else setColumns(6);

    if (width < 1200) {
      setRadius(100);
    } else {
      setRadius(200);
    }
  }, [width]);

  let leftSpacerIndex = -1;
  let rightSpacerIndex = -1;

  if (columns === 2) {
    leftSpacerIndex = 0;
    rightSpacerIndex = 1;
  }
  if (columns === 4) {
    leftSpacerIndex = 1;
    rightSpacerIndex = 2;
  }
  if (columns === 6) {
    leftSpacerIndex = 2;
    rightSpacerIndex = 3;
  }

  const headerItems = [];
  if (columns > 1) {
    for (let i = 0; i < columns; i++) {
      if (i === leftSpacerIndex) {
        headerItems.push(
          <ShapeSpacer key={`spacer-left`} side="left" radius={radius} />,
        );
      } else if (i === rightSpacerIndex) {
        headerItems.push(
          <ShapeSpacer key={`spacer-right`} side="right" radius={radius} />,
        );
      } else {
        headerItems.push(
          <div key={`placeholder-${i}`} style={{ height: 0 }} />,
        );
      }
    }
  }

  // Define components for MDX (responsive images)
  const components = {
    img: (props: any) => (
      <Image
        {...props}
        style={{
          maxWidth: "100%",
          height: "auto",
          display: "block",
          margin: "10px 0",
        }}
      />
    ),
    h2: (props: any) => (
      <h2
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
        {...props}
      />
    ),
  };

  return (
    <>
      <Container
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <h1>WRITE</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Last Updated: Jan 01 2026' 3:36AM</span>
        </div>
      </Container>

      <div style={{ width: "100%" }}>
        <Masonry
          className={s.writePage || ""}
          breakpointCols={breakpointColumns}
          columnClassName={s.writeCol || ""}
        >
          {/* Inject Spacers */}
          {headerItems}

          {/* Content Items */}
          {items.map((item, index) => {
            const columnIndex = index % columns;
            const isLeftSide = columnIndex <= leftSpacerIndex;
            return (
              <div
                key={item.uniqueId}
                className={s.writeItem}
                style={{
                  position: "relative",
                  textAlign: isLeftSide ? "right" : "left",
                }}
              >
                <span className={s.faintNumber || ""}>
                  {item.originalIndex.toString().padStart(3, "0")}
                </span>
                {/* Render MDX content */}
                <div className="mdx-content">
                  <ErrorBoundary fallback={<SkeletonLoader isLoading={true} />}>
                    <MDXRemote {...item.data.mdxSource} components={components} />
                  </ErrorBoundary>
                </div
                >
              </div>
            );
          })}
        </Masonry>
      </div>
      {/* ======================================================== */}
      {/* PHASE 2: ADMIN DASHBOARD OVERHAUL (Placeholder Implementation) */}
      {/* ======================================================== */}
      <div className="mt-20 pt-10 border-t border-gray-200">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Dashboard Overview
        </h2>

        {/* 1. STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ErrorBoundary fallback={<div><SkeletonLoader isLoading={true} /></div>}>
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
              <div className="text-sm font-semibold text-gray-500">Total Users</div>
              <div className="text-4xl font-bold text-indigo-600">1,240</div>
            </div>
          </ErrorBoundary>
          <ErrorBoundary fallback={<div><SkeletonLoader isLoading={true} /></div>}>
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
              <div className="text-sm font-semibold text-gray-500">Active Projects</div>
              <div className="text-4xl font-bold text-green-600">56</div>
            </div>
          </ErrorBoundary>
          <ErrorBoundary fallback={<div><SkeletonLoader isLoading={true} /></div>}>
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
              <div className="text-sm font-semibold text-gray-500">Monthly Revenue</div>
              <div className="text-4xl font-bold text-yellow-600">$12k</div>
            </div>
          </ErrorBoundary>
        </div>

        {/* 2. ACTIVITY FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-6 border-b pb-2">Activity Stream</h3>
            <ErrorBoundary fallback={<SkeletonLoader isLoading={true} />}>
              <div className="space-y-4">
                {/* Placeholder for Activity Items (simulating the item loop) */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500">System</p>
                  <p className="font-medium">User "Admin" updated pricing structure.</p>
                  <p className="text-xs text-gray-400">5 mins ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500">System</p>
                  <p className="font-medium">New user registered: Jane Doe.</p>
                  <p className="text-xs text-gray-400">1 hour ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500">System</p>
                  <p className="font-medium">New Moodboard created by John Doe.</p>
                  <p className="text-xs text-gray-400">3 hours ago</p>
                </div>
              </div>
            </ErrorBoundary>
          </div>

          {/* 3. QUICK ACTIONS */}
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-6 border-b pb-2">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Create New Project
              </button>
              <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                View Analytics Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
      <NewsletterStatic />
      <NewsletterModal />
    </>
  )
}
