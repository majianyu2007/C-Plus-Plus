#include <climits>
#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

int main(void) {
  int n{0}, m{0};
  cin >> n >> m;
  vector<int> vec(n, 0);
  for (auto it = vec.begin(); it < vec.end(); ++it) {
    cin >> *it;
  }

  if (m == 0) {
    cout << 0 << endl;
    return 0;
  }

  int window_sum{0};
  for (int i = 0; i < m; ++i) {
    window_sum += vec[i];
  }

  int min_sum{window_sum};
  for (int i = m; i < n; ++i) {
    window_sum += vec[i];
    window_sum -= vec[i - m];
    if (window_sum < min_sum) {
      min_sum = window_sum;
    }
  }

  cout << min_sum << endl;

  return 0;
}