---
title: "LeetCode 300: Longest Increasing Subsequence"
description: "Start with minimum tail values, reconstruct an actual longest increasing subsequence using predecessor indices, then optimize with binary search."
slug: lis
translationKey: lis
kind: articles
lang: en
pubDate: 2026-10-29
category: Algorithms
tags: [dp]
draft: false
---
## My starting point: replace the first tail not smaller than the current value

LeetCode 300 asks for the length of the longest strictly increasing subsequence. A subsequence does not have to be contiguous, but it must preserve the original order. Strictly increasing means consecutive selected values cannot be equal.

My initial implementation maintains a list named `dp`. For each value `v`, it scans for the first position satisfying `dp[j] >= v`. If such a position exists, it replaces that tail; otherwise, it appends `v`.

```java
public int lengthOfLIS(int[] nums) {
    List<Integer> dp = new ArrayList<>();

    for (int v : nums) {
        int flag = -1;
        for (int i = 0; i < dp.size(); i++) {
            if (dp.get(i) >= v) {
                flag = i;
                break;
            }
        }

        if (flag == -1) dp.add(v);
        else dp.set(flag, v);
    }

    return dp.size();
}
```

Here, `dp` does not store the longest length ending at each original array position. Instead:

**Among all strictly increasing subsequences in the processed prefix, `dp[k]` is the smallest possible final value of a subsequence of length `k + 1`.**

For two increasing subsequences of the same length, the one with the smaller tail is easier to extend. A smaller candidate can therefore replace a larger tail without losing future opportunities to build a longer subsequence.

If every existing tail is smaller than `v`, then `v` can extend the current longest subsequence. Otherwise, replacing the first tail not smaller than `v` keeps the length unchanged while potentially making future extensions easier.

## Why returning dp itself does not work

Consider:

```text
nums = [3, 5, 6, 2]
Changes to dp:
[3]
[3, 5]
[3, 5, 6]
[2, 5, 6]
```

The final size is `3`, which is the correct LIS length. But `[2, 5, 6]` is not a subsequence of the input: `2` appears after both `5` and `6`.

Different entries in `dp` may describe different candidate subsequences. **Each tail belongs to some valid subsequence, but placing all those tails together does not necessarily form one valid subsequence.**

The compressed state is enough to determine the length. To return an actual subsequence, I also need to preserve how it was formed.

## Record predecessors using original array indices

Keep the existing `dp` list and add two arrays:

| State            | Meaning                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `tailIndex[k]` | The original array index corresponding to `dp[k]`, the current tail of a candidate subsequence of length `k + 1`          |
| `prev[i]`      | The previous element's original index in the recorded subsequence ending at `nums[i]`, or `-1` if there is no predecessor |

Suppose `nums[i]` belongs at `dp[pos]`. It becomes the tail of a subsequence of length `pos + 1`.

If `pos > 0`, the candidate subsequence of length `pos` ends at `tailIndex[pos - 1]`. Record that position as the predecessor:

```java
prev[i] = pos == 0 ? -1 : tailIndex[pos - 1];
tailIndex[pos] = i;
```

These must be original array indices, rather than positions in `dp`. The contents of `dp` and `tailIndex` will change, but already processed positions in the original array remain fixed.

Each `prev[i]` is also assigned only when processing index `i`. Later changes to the best tails do not rewrite this historical predecessor link.

### A complete recording and reconstruction example

Take `[3, 5, 6, 2, 4, 7]`:

| Index `i` | Value | Position `pos` | Updated `dp`   | `prev[i]` |
| ----------- | ----- | ---------------- | ---------------- | ----------- |
| `0`       | `3` | `0`            | `[3]`          | `-1`      |
| `1`       | `5` | `1`            | `[3, 5]`       | `0`       |
| `2`       | `6` | `2`            | `[3, 5, 6]`    | `1`       |
| `3`       | `2` | `0`            | `[2, 5, 6]`    | `-1`      |
| `4`       | `4` | `1`            | `[2, 4, 6]`    | `3`       |
| `5`       | `7` | `3`            | `[2, 4, 6, 7]` | `2`       |

When processing `7`, the candidate of length `3` still ends at the `6` at original index `2`, so `prev[5] = 2`.

Start from the longest candidate's tail, `tailIndex[3] = 5`, and follow predecessor links:

```text
Indices: 5 → 2 → 1 → 0 → -1
Values:  7 → 6 → 5 → 3
```

Reverse the collected values to obtain `[3, 5, 6, 7]`. Although the later values `2` and `4` replaced the best tails for shorter lengths, they did not destroy the recorded chain `6 → 5 → 3`.

## Replace the linear scan with binary search

The original code scans from the beginning for the first tail `>= v`. Since `dp` remains strictly increasing, this search can use binary search instead.

Why is `dp` sorted? Let `pos` be the first position whose tail is not smaller than `v`:

- Every tail before `pos` is smaller than `v`.
- The old `dp[pos]` is at least `v`, and every later tail is strictly larger than the old `dp[pos]`, so it is also strictly larger than `v`.
- Replacing that position with `v` preserves strict ordering. If no such position exists, the appended `v` is larger than every existing tail.

The required operation is therefore a **lower bound: the first position with a value greater than or equal to `v`**.

```java
int left = 0, right = dp.size();
while (left < right) {
    int mid = left + (right - left) / 2;
    if (dp.get(mid) >= v) {
        right = mid;
    } else {
        left = mid + 1;
    }
}
int pos = left;
```

The search uses the half-open interval `[left, right)`. The final `pos` may equal `dp.size()`, which means the value should be appended.

**The `>=` comparison matters.** For `[2, 2, 2]`, each later `2` should replace position `0`, leaving a length of `1`. Searching for the first value strictly greater than `v` would allow equal values to extend the list, changing the problem to the longest nondecreasing subsequence.

## Complete Java implementation

This version adds predecessor tracking to my minimum-tail approach and replaces the inner scan with binary search. `longestIncreasingSubsequence` returns one actual LIS. The `lengthOfLIS` method keeps the interface required by the problem and reuses the same implementation.

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class Solution {
    public int lengthOfLIS(int[] nums) {
        return longestIncreasingSubsequence(nums).size();
    }

    public List<Integer> longestIncreasingSubsequence(int[] nums) {
        List<Integer> dp = new ArrayList<>();
        int[] tailIndex = new int[nums.length];
        int[] prev = new int[nums.length];

        for (int i = 0; i < nums.length; i++) {
            int v = nums[i];
            int left = 0, right = dp.size();

            // Find the first tail greater than or equal to v.
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (dp.get(mid) >= v) {
                    right = mid;
                } else {
                    left = mid + 1;
                }
            }

            int pos = left;
            prev[i] = pos == 0 ? -1 : tailIndex[pos - 1];

            if (pos == dp.size()) {
                dp.add(v);
            } else {
                dp.set(pos, v);
            }
            tailIndex[pos] = i;
        }

        List<Integer> result = new ArrayList<>();
        int current = dp.isEmpty() ? -1 : tailIndex[dp.size() - 1];

        while (current != -1) {
            result.add(nums[current]);
            current = prev[current];
        }

        Collections.reverse(result);
        return result;
    }
}
```

If only the length is needed for a LeetCode submission, the predecessor array, tail indices, and reconstruction can be omitted: return `dp.size()` directly. They are retained here to show how to recover the subsequence itself.

## Why it works

The algorithm maintains the minimum tail for each attainable length. Any later value that can extend a larger tail can also extend a smaller tail of the same length. Replacing a tail with a smaller value therefore preserves the opportunity to form a longer subsequence later.

For a new value `v`, let `pos` be the first position whose tail is not smaller than it. If `pos > 0`, then `dp[pos - 1] < v`, so the corresponding real subsequence can be extended to length `pos + 1`. If `pos == 0`, the current element alone forms a subsequence of length `1`.

Conversely, if an existing subsequence of length `pos + 1` ended below `v`, its minimum tail `dp[pos]` would also be below `v`, contradicting the search result. The current element cannot create a longer new subsequence in this case. The tracked maximum length increases only when the search position equals `dp.size()`.

Each predecessor comes from an earlier array position and has a strictly smaller value. Following `prev` and reversing the result therefore produces both increasing indices and strictly increasing values. Starting at the tail for the maximum length reconstructs a longest increasing subsequence.

## Complexity

Let $n$ be the input length and $L$ the LIS length.

| Version                           | Position search per element      | Total time                                   | Auxiliary space |
| --------------------------------- | -------------------------------- | -------------------------------------------- | --------------- |
| Initial implementation            | Linear scan, worst-case $O(n)$ | Worst-case $O(n^2)$                        | $O(n)$        |
| Binary search with reconstruction | Worst-case $O(\log(L+1))$      | $O(n\log(L+1))$, worst-case $O(n\log n)$ | $O(n)$        |

`ArrayList` provides $O(1)$ indexed `get` and `set`, and appending has amortized $O(1)$ cost. Reconstruction and reversal each take $O(L)$ time, so they do not change the overall bound.

The sorted structure is the auxiliary list `dp`; **the original array must not be sorted**. For example, `[3, 1, 2]` has an LIS length of `2`, but sorting it would incorrectly change that length to `3`.

## Edge cases and pitfalls

| Case or misconception                    | Expected result or handling                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `[2, 2, 2]`                            | The strictly increasing answer has length `1`; search for the first tail `>= v`                                |
| `[5, 4, 3]`                            | The length is `1`; this implementation reconstructs `[3]`                                                      |
| `[3, 5, 6, 2]`                         | The final `dp` is `[2, 5, 6]`, but predecessor links recover the valid subsequence `[3, 5, 6]`               |
| Multiple longest subsequences exist      | Return one of them; this implementation does not guarantee the lexicographically smallest or earliest-index answer |
| Empty array                              | This implementation returns an empty list and a length of `0`                                                    |
| The search position equals `dp.size()` | Append the value rather than calling `get` or `set` at that position                                           |
| Recording a `dp` position in `prev`  | Store the original array index instead, so later replacements cannot overwrite the historical link                 |

My approach has three steps: **compress candidates using minimum tails, preserve a real path with fixed predecessor indices, and use the ordered tail list to optimize the search with binary search.**
