import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const newPlace = await req.json();
    const filePath = path.join(process.cwd(), "public", "data", "places.json");

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const places = JSON.parse(fileContent);

    const newId = places.length ? Math.max(...places.map((p: any) => p.id)) + 1 : 1;
    const placeWithId = { id: newId, ...newPlace };

    places.push(placeWithId);
    fs.writeFileSync(filePath, JSON.stringify(places, null, 2));

    return NextResponse.json({ message: "Place added successfully" }, { status: 200 });
  } catch (err) {
    console.log("Error occurred while adding place:", err);
    return NextResponse.json({ error: "Failed to write to file" }, { status: 500 });
  }
}
