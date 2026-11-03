---
title: "lc56.合并区间"
description: "从排序扫描、TreeMap 扫描线和差分三个角度理解区间合并。"
slug: merge-intervals
translationKey: merge-intervals
kind: articles
lang: zh
pubDate: 2026-11-03
category: 算法
tags: [排序, 扫描线, 差分]
draft: false
---
给定若干闭区间，合并所有重叠的区间。**共享端点也算重叠**：`[1, 3]` 和 `[3, 5]` 要合成 `[1, 5]`，但 `[1, 2]` 和 `[3, 4]` 要保留为两段。

下面三段代码分别放进 `int[][] merge(int[][] intervals)` 方法中即可使用，所需导入为 `import java.util.*;`。用同一个无序输入 `[[6, 7], [3, 5], [1, 3]]` 对照，三种方法都应返回 `[[1, 5], [6, 7]]`。

## 1. 按左端点排序，再扫描

先用 `Arrays.sort` 按左端点排序。遍历时只需要看结果中的最后一段：

- 如果当前左端点大于上一段的右端点，另开一段。后面的左端点只会更大，上一段可以定下来了。
- 否则两段相交，把上一段的右端点更新为两者的最大值。取最大值是为了正确处理包含关系，例如 `[1, 5]` 不会被 `[2, 3]` 缩短。

排序花费 $O(n\log n)$，合并扫描花费 $O(n)$。如果输入已经按左端点有序，可以直接线性扫描。

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

排序后先处理 `[1, 3]`。下一段从 `3` 开始，条件 `last[1] < p[0]` 不成立，于是把右端更新到 `5`；`6 > 5`，所以 `[6, 7]` 另起一段。

## 2. 用 TreeMap 按端点做扫描线

对每段 `[l, r]`，在 `l` 记录 `+1`，在 `r` 记录 `-1`，同一坐标的事件相加。输入数组不用排序，因为 **TreeMap 按端点坐标维护键的顺序**。

从小到大处理端点：更新计数前若 `cnt == 0`，当前坐标就是新段的起点；累加该坐标的净变化后若 `cnt == 0`，就在这里结束这一段。两次判断分开写也能处理孤立的点区间 `[x, x]`：它的净变化是零，起点和终点都是 `x`。

例如 `[1, 3]` 和 `[3, 5]` 在坐标 `3` 的净变化是 `-1 + 1 = 0`，所以计数仍为 `1`，不会把两段拆开。若有 $u$ 个不同端点，时间为 $O(n\log(u+1))$，事件表占 $O(u)$ 空间。

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

这个例子的事件依次是 `1:+1, 3:0, 5:-1, 6:+1, 7:-1`。计数在 `5` 和 `7` 回到零，所以这两个坐标是结果的右端点。注意不要删掉净变化为零的键：孤立的 `[x, x]` 也依靠这个键被发现。

## 3. 用差分数组扫描有限坐标范围

当端点是非负整数且最大右端点 $M$ 不大时，可以直接用数组记录事件。把闭区间 `[l, r]` 映射为 `[2*l, 2*r]`，执行 `diff[2*l]++` 和 `diff[2*r+1]--`。扫描差分的前缀和，连续为正的位置就是一个合并区间。

**乘以 2 是为了保留整数之间的空隙。** `[1, 2]` 和 `[3, 4]` 映射为 `[2, 4]` 和 `[6, 8]`，未覆盖的坐标 `5` 对应原来的 `2.5`。共享端点的区间则仍然相连。

如果一段从 `start` 开始、到 `i` 首次变回零，最后一个覆盖位置就是 `i - 1`。还原为 `[start / 2, (i - 1) / 2]`；因为 `i - 1` 是偶数，Java 整数除法下右端也可写成 `i / 2`。数组开到 `2*M + 2`，最后一段也能遇到结束事件。

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

放大后，覆盖区间是 `[2, 10]` 与 `[12, 14]`。扫描到 `11` 时覆盖首次归零，输出 `[2 / 2, 11 / 2] = [1, 5]`；扫描到 `15` 时输出 `[6, 7]`。

## 怎么选

| 方法           | 时间              | 适用情况                                      |
| -------------- | ----------------- | --------------------------------------------- |
| 排序后扫描     | $O(n\log n)$    | 一般的区间合并，直接且易写                    |
| TreeMap 扫描线 | $O(n\log(u+1))$ | 坐标稀疏，或希望复用端点事件与覆盖计数        |
| 差分           | $O(n+M+1)$      | 非负整数端点且坐标范围小；额外空间 $O(M+1)$ |
