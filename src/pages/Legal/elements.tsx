// 약관·방침 공용 조판 요소. LegalLayout.tsx와 분리해야 Fast Refresh가 동작한다.

export const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-9 mb-3 text-[19px] font-bold first:mt-0">{children}</h2>
);

export const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-text-main mt-6 mb-2 text-[15px] font-bold">{children}</h3>
);

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-text-main/90 mb-3">{children}</p>
);

export const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="text-text-main/90 mb-3 list-disc space-y-1.5 pl-5">
    {children}
  </ul>
);

export const OL = ({ children }: { children: React.ReactNode }) => (
  <ol className="text-text-main/90 mb-3 list-decimal space-y-2 pl-5">
    {children}
  </ol>
);

/** 가로 스크롤을 표 안에서 처리한다. 첫 칸은 행 key로 쓴다. */
export const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: [string, ...React.ReactNode[]][];
}) => (
  <div className="border-border-main mb-4 overflow-x-auto rounded-lg border">
    <table className="w-full min-w-100 text-left text-[14px]">
      <thead className="bg-bg-main/60">
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="text-text-muted px-4 py-2.5 font-semibold whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row[0]}
            className="border-border-main text-text-main/90 border-t"
          >
            {row.map((cell, j) => (
              <td key={head[j]} className="px-4 py-2.5 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="border-primary/40 bg-primary/5 text-text-main/90 mb-4 rounded-lg border-l-2 px-4 py-3 text-[14px]">
    {children}
  </div>
);

export const B = ({ children }: { children: React.ReactNode }) => (
  <strong className="text-text-main font-bold">{children}</strong>
);
