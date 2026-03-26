#include <iostream>

using std::cout;
using std::endl;

int main(void) {
  int arr[6] = {1, 3, 5, 7, 9, 11};
  int *p = arr;
  cout << "修改后的元素值为：" << "{";
  for (auto i = 0; i < 6; ++i) {
    *p = (*p) * 2 + 1;
    cout << *p;
    if (i < 5)
      cout << ",";
    p++;
  }
  cout << "}" << endl;
  return 0;
}