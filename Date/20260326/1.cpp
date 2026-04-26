#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void) {
  int a{0}, b{0}, c{0};
  cout << "请输入三角形的三条边：" << endl;
  cin >> a >> b >> c;
  if (a && b && c && (a + b > c) && (a + c > b) && (b + c > a)) {
    cout << "周长是：" << a + b + c << endl;
  } else {
    cout << "输入不合法！" << endl;
  }
  return 0;
}