import React from "react";
import {
  DownloadOutlined,
  ExclamationOutlined,
  LoadingOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { Image, Space, Spin } from "antd";
import { Job } from "../types";

const JobItem = ({ id, result, status }: Job) => {
  const src = result;

  // you can download flipped and rotated image
  // https://codesandbox.io/s/zi-ding-yi-gong-ju-lan-antd-5-7-0-forked-c9jvmp
  const onDownload = (imgUrl: string) => {
    fetch(imgUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement<"a">("a");
        link.href = url;
        link.download = "image.png";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
      });
  };

  switch (status) {
    case "resolved":
      return (
        <Image
          className="p-1"
          loading="lazy"
          key={id}
          //   width={400}
          src={src || "images"}
          preview={{
            toolbarRender: (
              _,
              {
                image: { url },
                transform: { scale },
                actions: {
                  onFlipY,
                  onFlipX,
                  onRotateLeft,
                  onRotateRight,
                  onZoomOut,
                  onZoomIn,
                  onReset,
                },
              }
            ) => (
              <Space size={12} className="toolbar-wrapper">
                <DownloadOutlined onClick={() => onDownload(url)} />
                <SwapOutlined rotate={90} onClick={onFlipY} />
                <SwapOutlined onClick={onFlipX} />
                <RotateLeftOutlined onClick={onRotateLeft} />
                <RotateRightOutlined onClick={onRotateRight} />
                <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                <UndoOutlined onClick={onReset} />
              </Space>
            ),
          }}
        />
      );

    case "pending":
      return (
        <div className="h-64 w-full flex items-center justify-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      );

    case "failed":
      return (
        <div className="h-64 w-full flex items-center justify-center">
          <ExclamationOutlined style={{ fontSize: 48 }} />
          <div>
            <p>Failed to Assign Image </p>
            <ul className="text-xs text-gray-800">
              <li> + Unsplash Limit Reached</li>
              <li> + Abrupt Server Timeout</li>
            </ul>
          </div>
        </div>
      );
    default:
      break;
  }
};

export default JobItem;