export default function Loading() {
  return (
    <main
      className="min-h-screen bg-[#f5faf6] px-4 py-4 sm:px-6 sm:py-6 md:px-8"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Breadcrumb Skeleton */}
        <div className="mb-5 flex items-center gap-2">
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-3 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Profile / Welcome Card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-emerald-100 sm:h-20 sm:w-20" />

              <div className="min-w-0 flex-1">
                <div className="h-6 w-40 max-w-full animate-pulse rounded bg-gray-200 sm:w-56" />
                <div className="mt-3 h-3 w-28 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-3 w-48 max-w-full animate-pulse rounded bg-gray-200 sm:w-64" />

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="h-7 w-20 animate-pulse rounded-full bg-emerald-100" />
                  <div className="h-7 w-24 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
            </div>

            <div className="h-24 w-full animate-pulse rounded-xl bg-[#eef5ef] md:w-40" />
          </div>
        </section>

        {/* Statistics Skeleton */}
        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
          <div className="mb-5 h-5 w-36 animate-pulse rounded bg-gray-200" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-9 w-9 animate-pulse rounded-lg bg-emerald-50" />
                </div>

                <div className="mt-4 h-7 w-28 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-3 w-36 max-w-full animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </section>

        {/* Table / List Skeleton */}
        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="h-5 w-40 animate-pulse rounded bg-gray-200 sm:w-52" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="h-9 w-28 animate-pulse rounded-lg bg-emerald-50" />
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 md:block">
            <div className="flex items-center justify-between gap-4 bg-[#eef5ef] px-5 py-4">
              {[20, 16, 16, 16, 10].map((width, index) => (
                <div
                  key={index}
                  className="h-3 animate-pulse rounded bg-gray-200"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>

            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4"
              >
                {[20, 16, 16, 16, 10].map((width, index) => (
                  <div
                    key={index}
                    className="h-3 animate-pulse rounded bg-gray-100"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="h-4 w-36 max-w-full animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-3 w-24 animate-pulse rounded bg-gray-100" />

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center justify-center gap-3 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600 motion-reduce:animate-none" />

            <p className="text-sm font-medium text-gray-600">
              Math Point Academy লোড হচ্ছে...
            </p>
          </div>

          <div className="h-1 w-40 overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-600" />
          </div>
        </div>
      </div>
    </main>
  );
}