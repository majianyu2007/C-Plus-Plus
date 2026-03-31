#include <iostream>
#include <vector>

using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n = 0, m = 0;
  cin >> n >> m;

  vector<char> present(n + 1, 0);
  for (int i = 0; i < m; ++i) {
    int x = 0;
    cin >> x;
    present[x] = 1;
  }

  // 在编号 1..n 的路径上做最大独立集：
  // f[i] = max(f[i-1], f[i-2] + present[i])
  int prev2 = 0; // f[i-2]
  int prev1 = 0; // f[i-1]

  for (int i = 1; i <= n; ++i) {
    int cur = max(prev1, prev2 + (present[i] ? 1 : 0));
    prev2 = prev1;
    prev1 = cur;
  }

  cout << prev1 << '\n';
  return 0;
}