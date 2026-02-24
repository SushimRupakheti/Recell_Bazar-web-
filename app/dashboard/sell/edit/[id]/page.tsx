import React from "react";
import ItemEditClient from "./ItemEditClient";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  const id = params?.id;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <ItemEditClient id={id} />
    </div>
  );
}
