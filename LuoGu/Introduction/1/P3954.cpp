#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void)
{
    int A{0}, B{0}, C{0};
    cin >> A >> B >> C;
    double score = A * 0.2 + B * 0.3 + C * 0.5;
    cout << score << endl;
    return 0;
}