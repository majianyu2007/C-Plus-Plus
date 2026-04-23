#include "../headers/include/CRectangle.h"

#include <iostream>

using std::cin;
using std::cout;
using std::endl;

int main(void) {
    std::ios::sync_with_stdio(false);
    cin.tie(nullptr);
    CPoint2D P1;
    CRectangle CR1(P1, 1, 1);
    cout << "矩形 CR1 对角线长为：" << CR1.getDiagonalLength() << "；面积为：" << CR1.getArea()
         << "；周长为：" << CR1.getPerimeter() << "; 左下角坐标为 (" << CR1.getBottom_left().get_x()
         << ", " << CR1.getBottom_left().get_y() << ")" << endl;

    CR1.set_bottom_left(2, 2);
    CR1.set_width(3);
    CR1.set_height(4);
    cout << "矩形 CR1 对角线长为：" << CR1.getDiagonalLength() << "；面积为：" << CR1.getArea()
         << "；周长为：" << CR1.getPerimeter() << "; 左下角坐标为 (" << CR1.getBottom_left().get_x()
         << ", " << CR1.getBottom_left().get_y() << ")" << endl;

    CRectangle CR2(1, 1, 3, 4);
    cout << "矩形 CR2 对角线长为：" << CR2.getDiagonalLength() << "；面积为：" << CR2.getArea()
         << "；周长为：" << CR2.getPerimeter() << "; 左下角坐标为 (" << CR2.getBottom_left().get_x()
         << ", " << CR2.getBottom_left().get_y() << ")" << endl;

    CPoint2D P2(3, 4);
    CRectangle CR3(P2, 1, 1);
    cout << "矩形 CR3 对角线长为：" << CR3.getDiagonalLength() << "；面积为：" << CR3.getArea()
         << "；周长为：" << CR3.getPerimeter() << "; 左下角坐标为 (" << CR3.getBottom_left().get_x()
         << ", " << CR3.getBottom_left().get_y() << ")" << endl;

    cout << "矩形 CR1 与 CR2 面积之和为：" << add_area_I(CR1, CR2) << endl;
    cout << "矩形 CR1 与 CR2 面积之和为：" << CR1.add_area_II(CR2) << endl;

    return 0;
}
