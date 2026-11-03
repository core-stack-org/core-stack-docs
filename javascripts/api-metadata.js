// Fills the API Metadata page from the backend data dictionaries.
// Keep these URLs in sync with the links in use-precomputed-data/api-metadata.md.
(function () {
  const dictionaryUrls = {
    tehsil: "https://raw.githubusercontent.com/core-stack-org/core-stack-backend/main/public_api/data_dictionary/get_tehsil_data.json",
    apis: "https://raw.githubusercontent.com/core-stack-org/core-stack-backend/main/public_api/data_dictionary/other_public_api.json",
    waterbodies: "https://raw.githubusercontent.com/core-stack-org/core-stack-backend/main/public_api/data_dictionary/waterbody_api.json"
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);

  const flattenVariables = (variables, prefix = "") => {
    const rows = [];
    Object.entries(variables ?? {}).forEach(([name, metadata]) => {
      const path = prefix ? `${prefix}.${name}` : name;
      if (metadata && metadata.variables && typeof metadata.variables === "object") {
        rows.push(...flattenVariables(metadata.variables, path));
      } else {
        rows.push({ name: path, ...(metadata ?? {}) });
      }
    });
    return rows;
  };

  const renderTable = (variables) => {
    const rows = flattenVariables(variables).map((item) => `
      <tr>
        <td><code>${escapeHtml(item.name)}</code></td>
        <td>${escapeHtml(item.type)}</td>
        <td>${escapeHtml(item.unit)}</td>
        <td>${escapeHtml(item.description)}</td>
      </tr>`).join("");

    return rows
      ? `<div class="md-typeset__scrollwrap"><div class="md-typeset__table">
          <table>
            <thead><tr><th>Variable</th><th>Type</th><th>Unit</th><th>Description</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div></div>`
      : "<p>No variables are listed for this entry.</p>";
  };

  const renderDisclosure = (id, title, description, content, className = "api-disclosure") => `
    <details class="note ${className}" id="${escapeHtml(id)}">
      <summary>${escapeHtml(title)}</summary>
      ${description ? `<p>${escapeHtml(description)}</p>` : ""}
      ${content}
    </details>`;

  const renderApis = (dictionary, prefix = "api") => Object.entries(dictionary ?? {})
    .map(([key, api]) => renderDisclosure(
      `${prefix}-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
      api.name || key,
      api.description,
      renderTable(api.variables)
    ))
    .join("");

  const renderTehsilData = (layers) => {
    const layerSections = Object.entries(layers ?? {}).map(([key, layer]) => {
      const label = layer.name || key;
      const id = `layer-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
      return renderDisclosure(id, label, layer.description, renderTable(layer.variables), "layer-disclosure");
    }).join("");

    return renderDisclosure(
      "tehsil-data-dictionary",
      "Tehsil Data Dictionary",
      "Layer-wise fields returned by the tehsil data API. Expand a layer to view its variables.",
      layerSections || "<p>No layers are listed in this dictionary.</p>"
    );
  };

  const fetchJson = async (url, label) => {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`${label} request failed (${response.status}): ${url}`);
    return response.json();
  };

  const renderApiMetadata = () => {
    const datasetCatalog = document.getElementById("dataset-api-catalog");
    const waterbodyCatalog = document.getElementById("waterbody-api-catalog");
    const status = document.getElementById("metadata-status");
    if (!datasetCatalog || !waterbodyCatalog || !status) return;
    if (datasetCatalog.dataset.loaded === "true") return;
    datasetCatalog.dataset.loaded = "true";

    Promise.all([
      fetchJson(dictionaryUrls.tehsil, "Tehsil dictionary"),
      fetchJson(dictionaryUrls.apis, "Dataset API dictionary"),
      fetchJson(dictionaryUrls.waterbodies, "Waterbody API dictionary")
    ])
      .then(([tehsilDictionary, apiDictionary, waterbodyDictionary]) => {
        datasetCatalog.innerHTML = [
          renderTehsilData(tehsilDictionary),
          renderApis(apiDictionary, "dataset-api")
        ].join("");
        waterbodyCatalog.innerHTML = renderApis(waterbodyDictionary, "waterbody-api");
        status.textContent = "API metadata loaded successfully.";
        status.hidden = true;
      })
      .catch((error) => {
        datasetCatalog.dataset.loaded = "false";
        status.hidden = false;
        status.textContent = "Unable to load API metadata. Check the browser console and confirm that the three JSON files exist in the backend repository's public_api folder and are accessible from raw.githubusercontent.com.";
        console.error("Unable to load API metadata dictionaries.", error);
      });
  };

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(renderApiMetadata);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderApiMetadata);
  } else {
    renderApiMetadata();
  }
})();
