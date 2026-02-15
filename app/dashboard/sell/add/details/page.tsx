"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createItem, ItemPayload } from "@/lib/api/items";

export default function DashboardSellAddDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brand = searchParams?.get("brand") || "";
  const model = searchParams?.get("model") || "";

  const [step, setStep] = useState<number>(1);
  const [basePrefix, setBasePrefix] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [batteryHealth, setBatteryHealth] = useState<number>(100);
  const [chargerAvailable, setChargerAvailable] = useState<boolean>(true);
  const [factoryUnlock, setFactoryUnlock] = useState<boolean>(true);
  const [liquidDamage, setLiquidDamage] = useState<boolean>(false);
  const [switchOn, setSwitchOn] = useState<boolean>(true);
  const [receiveCall, setReceiveCall] = useState<boolean>(true);
  const [features1Condition, setFeatures1Condition] = useState<boolean>(true);
  const [features2Condition, setFeatures2Condition] = useState<boolean>(true);
  const [cameraCondition, setCameraCondition] = useState<boolean>(true);
  const [displayCondition, setDisplayCondition] = useState<boolean>(true);
  const [displayCracked, setDisplayCracked] = useState<boolean>(false);
  const [displayOriginal, setDisplayOriginal] = useState<boolean>(true);
  const [description, setDescription] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // determine whether the flow was opened from dashboard or public sell
    if (typeof window !== "undefined") {
      setBasePrefix(window.location.pathname.includes("/dashboard") ? "/dashboard" : "");
    }

    if (!brand || !model) router.replace(`${basePrefix}/sell/add`);
  }, [brand, model, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr: string[] = [];
    const fileArr: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await fileToDataUrl(file);
      arr.push(dataUrl);
      fileArr.push(file);
    }
    setPhotos((p) => [...p, ...arr]);
    setFiles((f) => [...f, ...fileArr]);
  };

  const fileToDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const buildPayload = (): ItemPayload => ({
    category: brand,
    phoneModel: model,
    year,
    batteryHealth,
    description,
    chargerAvailable,
    factoryUnlock,
    liquidDamage,
    switchOn,
    receiveCall,
    features1Condition,
    features2Condition,
    cameraCondition,
    displayCondition,
    displayCracked,
    displayOriginal,
    photos,
  });

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      let photoUrls: string[] = [];
      let sellerIdFromUpload: string | undefined;

      if (files.length > 0) {
        const uJson = await (await import("@/lib/api/items")).uploadPhotos(files);
        if (!uJson.success) throw new Error(uJson.message || "Upload failed");
        photoUrls = uJson.urls || [];
        sellerIdFromUpload = uJson.sellerId;
      }

      const payload = buildPayload();
      if (photoUrls.length) payload.photos = photoUrls;
      if (sellerIdFromUpload) payload.sellerId = sellerIdFromUpload;

      const res = await createItem(payload);
      setLoading(false);
      if (res?.success) {
        router.push(`${basePrefix}/sell`);
      } else {
        setMessage(res?.message || "Create failed");
      }
    } catch (err: any) {
      setLoading(false);
      setMessage(err?.message || "Create failed");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm text-gray-500">Sell / SellStart / <span className="text-gray-700">Phone Details</span></p>
      <h1 className="text-3xl font-semibold text-teal-600 mt-4">Answer the questions below:</h1>

      <div className="mt-6 flex items-center gap-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        {step === 1 && (
          <div>
            <Question label="Has your phone ever been liquid damage?">
              <RadioPair value={liquidDamage} onChange={setLiquidDamage} />
            </Question>

            <Question label="Does your device switch on?">
              <RadioPair value={switchOn} onChange={setSwitchOn} />
            </Question>

            <Question label="Does your phone make or receive calls?">
              <RadioPair value={receiveCall} onChange={setReceiveCall} />
            </Question>

            <Question label="Is your wifi, bluetooth and face id/touch id working?">
              <RadioPair value={features1Condition} onChange={setFeatures1Condition} />
            </Question>
          </div>
        )}

        {step === 2 && (
          <div>
            <Question label="Is there a problem with your camera?">
              <RadioPair value={!cameraCondition} onChange={(v) => setCameraCondition(!v)} />
            </Question>

            <Question label="Are your speakers, flashlight, or microphone working?">
              <RadioPair value={features2Condition} onChange={setFeatures2Condition} />
            </Question>

            <Question label="Do you have original power adapter and cable?">
              <RadioPair value={chargerAvailable} onChange={setChargerAvailable} />
            </Question>

            {/* Removed binary age question per mobile spec (age still editable in final step) */}
          </div>
        )}

        {step === 3 && (
          <div>
            <Question label="Is your display discolored, pixilated or non-functional?">
              <RadioPair value={!displayCondition} onChange={(v) => setDisplayCondition(!v)} />
            </Question>

            <Question label="Is your display original?">
              <RadioPair value={displayOriginal} onChange={setDisplayOriginal} />
            </Question>

            <Question label="Is your display cracked?">
              <RadioPair value={displayCracked} onChange={setDisplayCracked} />
            </Question>

            <div className="mt-6">
              <label className="block text-sm text-gray-700 mb-2">Upload the photos of your device.</label>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} />
              <div className="mt-4 flex gap-2">
                {photos.map((p, idx) => (
                  <img key={idx} src={p} className="w-24 h-24 object-cover border" />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm text-gray-700 mb-2">Description:</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-36 p-3 border rounded" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm text-gray-600">Year</div>
                <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1 p-2 border rounded w-full" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-600">Battery Health (%)</div>
                <input type="number" value={batteryHealth} onChange={(e) => setBatteryHealth(Number(e.target.value))} className="mt-1 p-2 border rounded w-full" />
              </label>
            </div>

            <div className="mt-6 text-sm text-gray-700">Review and submit. Photos and description will be sent to create the listing.</div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Link href="/dashboard/sell/add" className="px-6 py-3 border rounded-md text-teal-700">Cancel</Link>
        <div className="ml-auto flex items-center gap-4">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="px-6 py-3 border rounded">Back</button>
          )}

          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} className="bg-teal-700 text-white px-8 py-3 rounded-md">Next</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="bg-teal-700 text-white px-8 py-3 rounded-md">{loading ? 'Submitting...' : 'Submit'}</button>
          )}
        </div>
      </div>

      {message && <div className="mt-4 text-sm text-red-600">{message}</div>}
    </div>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-sm text-gray-700 mb-2">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function RadioPair({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-4">
      <label className="inline-flex items-center space-x-2">
        <input type="radio" checked={value === true} onChange={() => onChange(true)} className="form-radio h-4 w-4" />
        <span>Yes</span>
      </label>
      <label className="inline-flex items-center space-x-2">
        <input type="radio" checked={value === false} onChange={() => onChange(false)} className="form-radio h-4 w-4" />
        <span>No</span>
      </label>
    </div>
  );
}
