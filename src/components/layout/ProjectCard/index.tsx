"use client";

import Image from "next/image";
import React from "react";
import { type ProjectData } from "~/types/project";

interface ProjectCardProps {
  project: ProjectData;
  className?: string;
}

/**
 * Enhanced ProjectCard component tailored for displaying items in a public moodboard.
 * It is designed to be highly flexible to accommodate images, text snippets, and embedded content.
 * @param {ProjectCardProps} props
 * @returns {React.ReactElement}
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project, className = "" }) => {
  const { title, description, imageUrl, embedCode, tags, createdAt } = project;

  return (
    <div className={`relative group bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl border border-gray-100 ${className}`}>

      {/* Image/Media Background Area */}
      <div className="relative w-full h-64 md:h-72">
        {imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={`Preview for ${title}`}
              fill
              style={{ objectFit: "cover" }}
              className="transition duration-500 group-hover:opacity-90"
            />
          </div>
        ) : (
          // Fallback placeholder if no image is available
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-center p-4">No Image Available</div>
          </div>
        )}
      </div>

      {/* Overlay for information (Visibility changes on hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">

        {/* Title and Tags */}
        <div className="mb-3">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag: string) => (
              <span key={tag} className="text-xs font-medium px-3 py-1 bg-white/20 text-white rounded-full shadow-md">{tag}</span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-white mb-4 text-sm max-w-[80%]">{description}</p>

        {/* Call to Action */}
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-full text-sm transition duration-200">
          View Project
        </button>
      </div>

      {/* Visible Content (Bottom section) */}
      <div className="p-6">
        {/* Status Badge */}
        <span className="text-xs font-medium uppercase tracking-wider text-indigo-600 bg-indigo-100 py-1 px-3 rounded-full">
          {createdAt ? new Date(createdAt).toLocaleDateString() : "Date Unknown"}
        </span>

        {/* Embed Placeholder (For Vimeo/YouTube embeds) */}
        {embedCode && (
          <div className="mt-4 border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500 mb-2">📺 Embedded Content Preview (Source: {embedCode.substring(0, 20)}...)</p>
            {/* In a real app, this would mount an iframe */}
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
              [iFrame Embed Placeholder]
            </div>
          </div>
        )}

        {/* Tags/Metadata */}
        <div className="mt-4 flex flex-wrap gap-2">
          {tags?.map((tag: string) => (
            <span key={tag} className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
