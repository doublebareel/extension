import { useEffect, useState } from "react";
import "./styles.scss";
import { storageString } from "../shared/storage";
import type { Highlight } from "../shared/types";

const Popup = () => {
  const [testData, setTestData] = useState<Highlight[] | null>(null);

  useEffect(() => {
    chrome.storage.local.get(
      "highlights",
      (result: { highlights?: Highlight[] }) => {
        const highlights = result.highlights ?? [];

        console.log(highlights, "loaded highlights");

        setTestData(highlights);
      },
    );
  }, []);

  return (
    <div id="popupContainer">
      Brand name here
      <button onClick={() => chrome.runtime.openOptionsPage()}>
        Open Settings
      </button>
      <p>key: {storageString}</p>
      {testData && (
        <div>
          {testData.map((item) => (
            <div key={item.id}>
              <span>{item.id}</span>
              {" | "}
              <span>{item.text}</span>
              {" | "}
              <span>{item.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Popup;
