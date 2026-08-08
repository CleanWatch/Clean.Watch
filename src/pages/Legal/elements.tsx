/**
 * 약관·방침이 함께 쓰는 조판 요소.
 *
 * `LegalLayout.tsx`에 함께 두었더니 "컴포넌트만 export하라"는 경고가 났습니다
 * (react-refresh/only-export-components). 파일을 갈라 두면 편집 중 새로고침이
 * 온전히 동작합니다.
 */

export const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-9 mb-3 text-[19px] font-bold first:mt-0">{children}</h2>
);

export const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-text-main mt-6 mb-2 text-[15px] font-bold">{children}</h3>
);

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-text-main/90 mb-3">{children}</p>
);

/** 번호 없는 목록 */
export const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="text-text-main/90 mb-3 list-disc space-y-1.5 pl-5">
    {children}
  </ul>
);

/** 조항 번호가 붙는 목록 */
export const OL = ({ children }: { children: React.ReactNode }) => (
  <ol className="text-text-main/90 mb-3 list-decimal space-y-2 pl-5">
    {children}
  </ol>
);

/**
 * 표.
 *
 * 좁은 화면에서 표는 부모를 밀어냅니다. 가로 스크롤을 자기 안에서 처리하도록
 * 감싸 둡니다 — 페이지 자체가 좌우로 흔들리면 안 됩니다.
 *
 * 행의 첫 칸을 `string`으로 못박은 것은 그것을 행 key로 쓰기 때문입니다.
 * 배열 순번을 key로 쓰면 경고가 나고, 실제로도 순서가 바뀌면 어긋납니다.
 */
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

/** 눈에 띄어야 하는 고지 */
export const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="border-primary/40 bg-primary/5 text-text-main/90 mb-4 rounded-lg border-l-2 px-4 py-3 text-[14px]">
    {children}
  </div>
);

/** 강조 */
export const B = ({ children }: { children: React.ReactNode }) => (
  <strong className="text-text-main font-bold">{children}</strong>
);
