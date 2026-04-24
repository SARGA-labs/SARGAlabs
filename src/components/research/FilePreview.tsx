/* eslint-disable @next/next/no-img-element */
"use client";

import s from "./workspace.module.scss";

export function FilePreview({
	mime,
	url,
	name,
}: {
	mime: string;
	url: string;
	name: string;
}) {
	if (mime.startsWith("image/")) {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={url} alt={name} className={s.preview_content} />;
	}

	if (mime.startsWith("video/")) {
		return (
			<video src={url} controls className={s.preview_content}>
				<track kind="captions" />
			</video>
		);
	}

	if (mime.startsWith("audio/")) {
		return (
			<audio src={url} controls className={s.preview_content}>
				<track kind="captions" />
			</audio>
		);
	}

	if (mime === "application/pdf") {
		return <iframe src={url} title={name} className={s.iframe_preview} />;
	}

	if (mime === "text/markdown" || mime === "text/plain") {
		// Basic iframe or object for text, normally would use a markdown renderer
		return <iframe src={url} title={name} className={s.iframe_preview} />;
	}

	return (
		<div className={s.unsupported}>
			<p>No preview available for {mime}</p>
			<a href={url} target="_blank" rel="noopener noreferrer">
				Download File
			</a>
		</div>
	);
}
