import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadDigestCsv } from "@/lib/downloadCSV";
import type {
  DigestPeptidesResponse,
  DigestResponse,
  CriteriaResponse,
  PeptideResponse,
} from "@/components/providers/DigestProvider";

/* ── Fixtures ── */

const makeCriteria = (overrides: Partial<CriteriaResponse>[] = []): CriteriaResponse[] =>
  overrides.map((o, i) => ({
    code: `criterion_${i + 1}`,
    goal: `Goal ${i + 1}`,
    rationale: `Rationale ${i + 1}`,
    rank: i + 1,
    ...o,
  }));

const makePeptide = (overrides: Partial<PeptideResponse> = {}): PeptideResponse => ({
  id: "pep-1",
  sequence: "ACDEF",
  position: 1,
  pi: 7.5,
  charge_state: 2,
  max_kd_score: 0.85,
  rank: 1,
  criteria_ranks: [],
  ...overrides,
});

const makePeptidesResponse = (
  overrides: Partial<DigestPeptidesResponse> = {}
): DigestPeptidesResponse => ({
  digest_id: "abcdef1234567890",
  peptides: [makePeptide()],
  criteria: [],
  ...overrides,
});

const makeDigestResponse = (
  overrides: Partial<DigestResponse> = {}
): DigestResponse => ({
  id: "digest-id",
  status: "completed",
  user_id: "user-1",
  protease: "trypsin",
  protein_name: "My Protein",
  sequence: "ACDEF",
  created_at: "2026-02-26T12:56:00",
  updated_at: "2026-02-26T12:56:00",
  ...overrides,
});

/* ── DOM mock helpers ── */

function setupDomMocks() {
  let capturedBlob: Blob | undefined;
  let capturedAnchor: Partial<HTMLAnchorElement> & { click: ReturnType<typeof vi.fn> };

  capturedAnchor = { href: "", download: "", click: vi.fn() };

  vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
    capturedBlob = blob as Blob;
    return "blob:mock-url";
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(document, "createElement").mockReturnValue(
    capturedAnchor as unknown as HTMLAnchorElement
  );

  return {
    get blob() {
      return capturedBlob;
    },
    get anchor() {
      return capturedAnchor;
    },
  };
}

/* ── Tests ── */

describe("downloadDigestCsv", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("DOM wiring", () => {
    it("calls URL.createObjectURL with a text/csv Blob", async () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(makePeptidesResponse(), makeDigestResponse());

      expect(URL.createObjectURL).toHaveBeenCalledOnce();
      expect(mocks.blob).toBeInstanceOf(Blob);
      expect(mocks.blob?.type).toBe("text/csv");
    });

    it("sets href, download, and calls click on the anchor", () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(makePeptidesResponse(), makeDigestResponse());

      expect(mocks.anchor.href).toBe("blob:mock-url");
      expect(mocks.anchor.click).toHaveBeenCalledOnce();
    });

    it("calls URL.revokeObjectURL after click", () => {
      setupDomMocks();
      downloadDigestCsv(makePeptidesResponse(), makeDigestResponse());

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("filename (sanitizeFilenameSegment)", () => {
    beforeEach(() => {
      vi.stubEnv("TZ", "UTC");
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("uses protein name with spaces converted to hyphens", () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(
        makePeptidesResponse(),
        makeDigestResponse({ protein_name: "My Protein" })
      );
      expect(mocks.anchor.download).toMatch(/^My-Protein-/);
    });

    it("strips special characters like parentheses from protein name", () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(
        makePeptidesResponse(),
        makeDigestResponse({ protein_name: "Albumin (human)" })
      );
      expect(mocks.anchor.download).toMatch(/^Albumin-human-/);
    });

    it("falls back to 'digest' prefix when protein name is null", () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(
        makePeptidesResponse(),
        makeDigestResponse({ protein_name: null })
      );
      expect(mocks.anchor.download).toMatch(/^digest-/);
    });

    it("falls back to 'digest' prefix when digestResponse is null", () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(makePeptidesResponse(), null);
      expect(mocks.anchor.download).toMatch(/^digest-/);
    });

    it("truncates protein name longer than 40 characters", () => {
      const mocks = setupDomMocks();
      const longName = "A".repeat(50);
      downloadDigestCsv(
        makePeptidesResponse(),
        makeDigestResponse({ protein_name: longName })
      );
      const namePart = mocks.anchor.download!.split("-")[0];
      expect(namePart.length).toBeLessThanOrEqual(40);
    });

    it("falls back to 'digest' when protein name yields empty after sanitizing", () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(
        makePeptidesResponse(),
        makeDigestResponse({ protein_name: "!!!" })
      );
      expect(mocks.anchor.download).toMatch(/^digest-/);
    });

    it("uses first 8 chars of digest_id when digestResponse has no created_at", () => {
      const mocks = setupDomMocks();
      const peptidesResponse = makePeptidesResponse({ digest_id: "abcdef1234567890" });
      downloadDigestCsv(peptidesResponse, null);
      expect(mocks.anchor.download).toContain("abcdef12");
    });

    it("uses formatted date from created_at when digestResponse is provided", () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(
        makePeptidesResponse(),
        makeDigestResponse({ created_at: "2026-02-26T12:56:00" })
      );
      expect(mocks.anchor.download).toContain("2026-02-26");
    });

    it("filename ends with .csv", () => {
      const mocks = setupDomMocks();
      downloadDigestCsv(makePeptidesResponse(), makeDigestResponse());
      expect(mocks.anchor.download).toMatch(/\.csv$/);
    });
  });

  describe("CSV content (escapeCsvField, formatCell, buildCsv)", () => {
    async function getCsvText(
      peptidesResponse: DigestPeptidesResponse,
      digestResponse: DigestResponse | null = null
    ): Promise<string> {
      let capturedBlob: Blob | undefined;
      vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
        capturedBlob = blob as Blob;
        return "blob:mock";
      });
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
      vi.spyOn(document, "createElement").mockReturnValue({
        href: "",
        download: "",
        click: vi.fn(),
      } as unknown as HTMLAnchorElement);

      downloadDigestCsv(peptidesResponse, digestResponse);
      return capturedBlob!.text();
    }

    describe("header row", () => {
      it("includes fixed columns in order", async () => {
        const csv = await getCsvText(makePeptidesResponse({ criteria: [] }));
        const header = csv.split("\n")[0];
        expect(header).toBe("#,POSITION,SEQUENCE,PI,CHARGE,MAX KD,RANK");
      });

      it("appends criteria codes uppercased with underscores replaced by spaces", async () => {
        const criteria = makeCriteria([
          { code: "hydro_phobicity" },
          { code: "charge_state" },
        ]);
        const csv = await getCsvText(makePeptidesResponse({ criteria }));
        const header = csv.split("\n")[0];
        expect(header).toContain("HYDRO PHOBICITY");
        expect(header).toContain("CHARGE STATE");
      });

      it("wraps a criteria code containing a comma in double quotes", async () => {
        const criteria = makeCriteria([{ code: "foo,bar" }]);
        const csv = await getCsvText(makePeptidesResponse({ criteria }));
        const header = csv.split("\n")[0];
        expect(header).toContain('"FOO,BAR"');
      });
    });

    describe("peptide rows", () => {
      it("produces only a header row when peptides array is empty", async () => {
        const csv = await getCsvText(makePeptidesResponse({ peptides: [] }));
        const lines = csv.split("\n");
        expect(lines).toHaveLength(1);
      });

      it("index column is 1-based", async () => {
        const peptides = [makePeptide({ id: "p1" }), makePeptide({ id: "p2", position: 2 })];
        const csv = await getCsvText(makePeptidesResponse({ peptides }));
        const rows = csv.split("\n").slice(1);
        expect(rows[0]).toMatch(/^1,/);
        expect(rows[1]).toMatch(/^2,/);
      });

      it("emits empty string for null pi, charge_state, max_kd_score", async () => {
        const peptide = makePeptide({ pi: null, charge_state: null, max_kd_score: null });
        const csv = await getCsvText(makePeptidesResponse({ peptides: [peptide] }));
        const row = csv.split("\n")[1];
        const cells = row.split(",");
        // PI is index 3, CHARGE index 4, MAX KD index 5
        expect(cells[3]).toBe("");
        expect(cells[4]).toBe("");
        expect(cells[5]).toBe("");
      });

      it("stringifies numeric values for pi, charge_state, max_kd_score", async () => {
        const peptide = makePeptide({ pi: 7.5, charge_state: 2, max_kd_score: 0.85 });
        const csv = await getCsvText(makePeptidesResponse({ peptides: [peptide] }));
        const row = csv.split("\n")[1];
        const cells = row.split(",");
        expect(cells[3]).toBe("7.5");
        expect(cells[4]).toBe("2");
        expect(cells[5]).toBe("0.85");
      });

      it("marks criteria_ranks membership as true/false per criterion column", async () => {
        const criteria = makeCriteria([{ rank: 1 }, { rank: 2 }, { rank: 3 }]);
        const peptide = makePeptide({ criteria_ranks: [1, 3] });
        const csv = await getCsvText(makePeptidesResponse({ peptides: [peptide], criteria }));
        const row = csv.split("\n")[1];
        const cells = row.split(",");
        // Criterion columns start at index 7 (after #, POS, SEQ, PI, CHARGE, MAX KD, RANK)
        expect(cells[7]).toBe("true");   // rank 1 — in criteria_ranks
        expect(cells[8]).toBe("false");  // rank 2 — not in criteria_ranks
        expect(cells[9]).toBe("true");   // rank 3 — in criteria_ranks
      });
    });

    describe("escapeCsvField", () => {
      it("does not quote a plain alphanumeric sequence", async () => {
        const peptide = makePeptide({ sequence: "ACDEF" });
        const csv = await getCsvText(makePeptidesResponse({ peptides: [peptide] }));
        const row = csv.split("\n")[1];
        expect(row).toContain("ACDEF");
        expect(row).not.toContain('"ACDEF"');
      });

      it("wraps a sequence containing a comma in double quotes", async () => {
        const peptide = makePeptide({ sequence: "AC,DEF" });
        const csv = await getCsvText(makePeptidesResponse({ peptides: [peptide] }));
        const row = csv.split("\n")[1];
        expect(row).toContain('"AC,DEF"');
      });

      it("doubles internal double quotes and wraps field", async () => {
        const peptide = makePeptide({ sequence: 'AC"DEF' });
        const csv = await getCsvText(makePeptidesResponse({ peptides: [peptide] }));
        const row = csv.split("\n")[1];
        expect(row).toContain('"AC""DEF"');
      });

      it("wraps a sequence containing a newline in double quotes", async () => {
        const peptide = makePeptide({ sequence: "AC\nDEF" });
        const csv = await getCsvText(makePeptidesResponse({ peptides: [peptide] }));
        // Cannot split by \n here because the escaped field itself contains a newline;
        // instead assert on the full CSV string.
        expect(csv).toContain('"AC\nDEF"');
      });
    });
  });
});
