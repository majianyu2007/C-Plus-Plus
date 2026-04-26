#include "../headers/include/CRectangle.h"

#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main() {
    CPoint2D P1;
    CRectangle CR1(P1, 3, 4);
    cout << "CR1 " << CR1 << endl;

    CRectangle CR2;
    cin >> CR2;
    cout << "CR2 " << CR2 << endl;

    CRectangle CR3 = CR1 + CR2;
    cout << "CR3 " << CR3 << endl;

    CRectangle CR4 = ++CR1;
    cout << "CR4 " << CR4 << endl;

    CRectangle CR5 = CR4++;
    cout << "CR4 " << CR4 << endl;
    cout << "CR5 " << CR5 << endl;

    CRectangle CR6 = CR5 - 2;
    cout << "CR6 " << CR6 << endl;

    return 0;
}
