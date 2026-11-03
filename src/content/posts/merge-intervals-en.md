---
title: "LeetCode 56: Merge Intervals"
description: "Compare sorting and scanning, a TreeMap sweep line, and a difference array. "
slug: merge-intervals
translationKey: merge-intervals
kind: articles
lang: en
pubDate: 2026-11-03
category: Algorithms
tags: [Sorting, Sweep Line, Difference Array]
draft: false
---
Merge overlapping closed intervals. **A shared endpoint counts as overlap**: `[1, 3]` and `[3, 5]` merge into `[1, 5]`, while `[1, 2]` and `[3, 4]` stay separate.

Each snippet is the body of a separate `int[][] merge(int[][] intervals)` method and uses `import java.util.*;`. Try the same unsorted input `[[6, 7], [3, 5], [1, 3]]`: all three methods return `[[1, 5], [6, 7]]`.

## 1. Sort by left endpoint, then scan

Use `Arrays.sort` to order intervals by their left endpoints. As you scan, compare the current interval with the last interval in the result:

- If the current start is greater than the last end, start a new interval. All later starts are at least as large, so the previous interval is complete.
- Otherwise, the intervals overlap. Keep the greater of the two right endpoints so that merging `[1, 5]` with `[2, 3]` does not shorten it.

Sorting takes $O(n\log n)$ time and the scan takes $O(n)$. If the input is already sorted by start, only the linear scan is needed.

```java
Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
List<int[]> ans = new ArrayList<>();

for (int[] p : intervals) {
    if (ans.isEmpty() || ans.get(ans.size() - 1)[1] < p[0]) {
        ans.add(new int[]{p[0], p[1]});
    } else {
        int[] last = ans.get(ans.size() - 1);
        last[1] = Math.max(last[1], p[1]);
    }
}

return ans.toArray(new int[0][]);
```

After sorting, `[1, 3]` comes first. The next interval starts at `3`, so `last[1] < p[0]` is false and the end extends to `5`. Since `6 > 5`, `[6, 7]` starts a separate interval.

## 2. Sweep endpoints with a TreeMap

For each `[l, r]`, record `+1` at `l` and `-1` at `r`, adding events at the same coordinate together. The input array does not need sorting: **TreeMap keeps the endpoint keys in coordinate order**.

Visit each coordinate in ascending order. If `cnt == 0` before the update, mark this coordinate as the start of an interval. Add the net change. If `cnt == 0` afterward, finish the interval here. Keeping the checks separate handles an isolated point interval `[x, x]`: its net change is zero, and both boundaries are `x`.

For `[1, 3]` and `[3, 5]`, the net change at `3` is `-1 + 1 = 0`. The count stays at `1`, so coverage does not split. With $u$ distinct endpoints, the time is $O(n\log(u+1))$ and the event map uses $O(u)$ space.

```java
Map<Integer, Integer> events = new TreeMap<>();
for (int[] p : intervals) {
    events.merge(p[0], 1, Integer::sum);
    events.merge(p[1], -1, Integer::sum);
}

List<int[]> ans = new ArrayList<>();
int cnt = 0, start = 0;
for (Map.Entry<Integer, Integer> e : events.entrySet()) {
    int x = e.getKey();
    if (cnt == 0) start = x;
    cnt += e.getValue();
    if (cnt == 0) ans.add(new int[]{start, x});
}

return ans.toArray(new int[0][]);
```

The events are `1:+1, 3:0, 5:-1, 6:+1, 7:-1`. The count returns to zero at `5` and `7`, which are the resulting right endpoints. Keep keys with a zero net change: an isolated `[x, x]` relies on such a key to be discovered.

## 3. Scan a bounded coordinate range with a difference array

When endpoints are nonnegative integers and the maximum right endpoint $M$ is small, an array can store the events directly. Map `[l, r]` to `[2*l, 2*r]`, then apply `diff[2*l]++` and `diff[2*r+1]--`. Each run of positive prefix sums represents one merged interval.

**Doubling preserves the gaps between integer coordinates.** The intervals `[1, 2]` and `[3, 4]` map to `[2, 4]` and `[6, 8]`. The uncovered coordinate `5` represents the original point `2.5`. Intervals with a shared endpoint still meet after doubling.

If a run begins at `start` and coverage first drops to zero at `i`, its last covered coordinate is `i - 1`. Convert back to `[start / 2, (i - 1) / 2]`. Since `i - 1` is even, Java integer division also allows `i / 2` for the right endpoint. A length of `2*M + 2` leaves room for the final closing event.

```java
int mx = 0;
for (int[] p : intervals) {
    mx = Math.max(mx, p[1]);
}

int[] diff = new int[2 * mx + 2];
for (int[] p : intervals) {
    diff[2 * p[0]]++;
    diff[2 * p[1] + 1]--;
}

List<int[]> ans = new ArrayList<>();
int sumD = 0, start = -1;
for (int i = 0; i < diff.length; i++) {
    sumD += diff[i];
    if (sumD > 0) {
        if (start < 0) start = i;
    } else if (start >= 0) {
        ans.add(new int[]{start / 2, i / 2});
        start = -1;
    }
}

return ans.toArray(new int[0][]);
```

After doubling, the covered runs are `[2, 10]` and `[12, 14]`. At `11`, coverage drops to zero and the code emits `[2 / 2, 11 / 2] = [1, 5]`. At `15`, it emits `[6, 7]`.

## Choosing a method

| Method           | Time              | When it fits                                                               |
| ---------------- | ----------------- | -------------------------------------------------------------------------- |
| Sort and scan    | $O(n\log n)$    | General interval merging; the most direct implementation                   |
| TreeMap sweep    | $O(n\log(u+1))$ | Sparse coordinates, or when endpoint events and coverage counts are useful |
| Difference array | $O(n+M+1)$      | Nonnegative integer endpoints in a small range; $O(M+1)$ auxiliary space |
