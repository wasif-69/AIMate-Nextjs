"use client";

import HeaderChat from "@/component/AIModels/Chat/ChatHeader";
import ChatInput from "@/component/AIModels/Chat/ChatInput";
import ChatText from "@/component/AIModels/Chat/ChatText";
import React, { useState } from "react";

interface PageProps {
  params: {
    ModelID: string; // this matches the folder name [id]
  };
}

export default function Page({ params }: PageProps) {
  const { ModelID } = params;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <HeaderChat modelId={ModelID} />
      <ChatText modelId={ModelID} isLoading={isLoading} />
      <ChatInput modelId={ModelID} isLoading={isLoading} setIsLoading={setIsLoading} />
    </div>
  );
}
