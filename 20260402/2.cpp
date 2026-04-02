#include <cstring>
#include <iostream>

using namespace std;

class Point {
  private:
    double x, y;
    char *label;

  public:
    Point() {
        x = 0;
        y = 0;
        label = new char[strlen("Original Point") + 1];
        strcpy(label, "Original Point");
        cout << label << "调用了不带参数的构造函数！" << endl;
    }

    Point(double x_, double y_, const char *label_) {
        x = x_;
        y = y_;
        label = new char[strlen(label_) + 1];
        strcpy(label, label_);
        cout << label << "调用了带三个参数的构造函数！" << endl;
    }

    Point(const Point &other) {
        x = other.x;
        y = other.y;
        label = new char[strlen(other.label) + 1];
        strcpy(label, other.label);
        cout << "调用了拷贝构造函数！" << endl;
    }

    Point(const char *label_) : Point(0, 0, label_) {
        cout << label << "委托了Point(0, 0, label_)函数实现对象的构造！" << endl;
    }

    ~Point() {
        cout << label << "调用了析构函数！" << endl;
        delete[] label;
    }

    void set_Point(double x_, double y_, const char *label_) {
        x = x_;
        y = y_;
        delete[] label;
        label = new char[strlen(label_) + 1];
        strcpy(label, label_);
    }

    void print() const { cout << label << "的坐标为：（" << x << ", " << y << "）" << endl; }
};

int main(void) {
    Point Original_Point;
    Original_Point.print();
    Point First_Point(1.0, 2.0, "First Point");
    First_Point.print();
    Point Second_Point(First_Point);
    Second_Point.print();
    cout << "很显然，这两个点是一样的！请修改！" << endl;
    Second_Point.set_Point(6.0, 8.0, "Second Point");
    Second_Point.print();
    Point Third_Point("Third Point");
    Third_Point.print();
    return 0;
}
