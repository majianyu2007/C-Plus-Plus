#include <iostream>

using namespace std;

class CRectangle {
  protected:
    double width, height;

  public:
    CRectangle(double wid = 1.0, double hei = 1.0) : width(wid), height(hei) {}

    double getWidth() const { return width; }
    void setWidth(double newWid) { width = newWid; }

    double getHeight() const { return height; }
    void setHeight(double newHei) { height = newHei; }

    double area() const { return width * height; }
    double perimeter() const { return (width + height) * 2; }

    void scale(double fw, double fh) {
        width *= fw;
        height *= fh;
    }
};

class CSquare : public CRectangle {
  public:
    CSquare(double side = 1.0) : CRectangle(side, side) {}

    double getSide() const { return width; }

    void setSide(double side) {
        width = side;
        height = side;
    }

    void scale(double factor) {
        width *= factor;
        height *= factor;
    }
};

int main() {
    CSquare sq(5.0);
    cout << "Initial side: " << sq.getSide() << endl;
    cout << "Area: " << sq.area() << ", Perimeter: " << sq.perimeter() << endl;

    sq.scale(1.5);
    cout << "After scale(1.5), side: " << sq.getSide() << endl;
    cout << "Area: " << sq.area() << ", Perimeter: " << sq.perimeter() << endl;

    sq.setSide(3.0);
    cout << "After setSide(3.0), side: " << sq.getSide() << endl;
    cout << "Area: " << sq.area() << ", Perimeter: " << sq.perimeter() << endl;

    return 0;
}
