#include <iomanip>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <vector>

using namespace std;

static string formatColor(unsigned int color) {
    ostringstream os;
    os << "0x" << uppercase << hex << setw(6) << setfill('0') << color << nouppercase << dec;
    return os.str();
}

class Shape {
  public:
    Shape(double x, double y, unsigned int color) : x_(x), y_(y), color_(color) {}
    virtual ~Shape() {}

    virtual void draw(ostream &os) const = 0;
    virtual void scale(double factor) = 0;

    void move(double dx, double dy) {
        x_ += dx;
        y_ += dy;
    }

    void setColor(unsigned int newColor) { color_ = newColor; }

  protected:
    double x_;
    double y_;
    unsigned int color_;
};

class CRectangle : public Shape {
  public:
    CRectangle(double x, double y, double width, double height, unsigned int color)
        : Shape(x, y, color), width_(width), height_(height) {}

    void draw(ostream &os) const override {
        os << "Rectangle center=(" << x_ << ", " << y_ << ") size=(" << width_ << ", " << height_
           << ") color=" << formatColor(color_);
    }

    void scale(double factor) override {
        width_ *= factor;
        height_ *= factor;
    }

  private:
    double width_;
    double height_;
};

class CEllipse : public Shape {
  public:
    CEllipse(double x, double y, double rx, double ry, unsigned int color)
        : Shape(x, y, color), rx_(rx), ry_(ry) {}

    void draw(ostream &os) const override {
        os << "Ellipse center=(" << x_ << ", " << y_ << ") radius=(" << rx_ << ", " << ry_
           << ") color=" << formatColor(color_);
    }

    void scale(double factor) override {
        rx_ *= factor;
        ry_ *= factor;
    }

  private:
    double rx_;
    double ry_;
};

class CTriangle : public Shape {
  public:
    CTriangle(double x, double y, double base, double height, unsigned int color)
        : Shape(x, y, color), base_(base), height_(height) {}

    void draw(ostream &os) const override {
        os << "IsoscelesTriangle center=(" << x_ << ", " << y_ << ") base=" << base_
           << " height=" << height_ << " color=" << formatColor(color_);
    }

    void scale(double factor) override {
        base_ *= factor;
        height_ *= factor;
    }

  private:
    double base_;
    double height_;
};

class CDonut : public Shape {
  public:
    CDonut(double x, double y, double outerA, double outerB, double ratio, unsigned int color)
        : Shape(x, y, color), outerA_(outerA), outerB_(outerB), ratio_(ratio) {
        if (ratio_ <= 0.0 || ratio_ >= 1.0) {
            ratio_ = 0.5;
        }
    }

    void draw(ostream &os) const override {
        os << "Donut center=(" << x_ << ", " << y_ << ") outer=(" << outerA_ << ", " << outerB_
           << ") innerRatio=" << ratio_ << " color=" << formatColor(color_);
    }

    void scale(double factor) override {
        outerA_ *= factor;
        outerB_ *= factor;
    }

  private:
    double outerA_;
    double outerB_;
    double ratio_;
};

int main() {
    vector<unique_ptr<Shape>> shapes;
    string type;

    cout << "Input shapes (Exit to finish):" << endl;
    while (cin >> type && type != "Exit") {
        if (type == "Rectangle") {
            double x, y, w, h;
            unsigned int color;
            cin >> x >> y >> w >> h >> hex >> color >> dec;
            shapes.push_back(unique_ptr<Shape>(new CRectangle(x, y, w, h, color)));
        } else if (type == "Ellipse") {
            double x, y, rx, ry;
            unsigned int color;
            cin >> x >> y >> rx >> ry >> hex >> color >> dec;
            shapes.push_back(unique_ptr<Shape>(new CEllipse(x, y, rx, ry, color)));
        } else if (type == "Triangle") {
            double x, y, base, h;
            unsigned int color;
            cin >> x >> y >> base >> h >> hex >> color >> dec;
            shapes.push_back(unique_ptr<Shape>(new CTriangle(x, y, base, h, color)));
        } else if (type == "Donut") {
            double x, y, outerA, outerB, ratio;
            unsigned int color;
            cin >> x >> y >> outerA >> outerB >> ratio >> hex >> color >> dec;
            shapes.push_back(unique_ptr<Shape>(new CDonut(x, y, outerA, outerB, ratio, color)));
        } else {
            string rest;
            getline(cin, rest);
        }
    }

    cout << "\nOriginal shapes:" << endl;
    for (size_t i = 0; i < shapes.size(); ++i) {
        cout << setw(2) << i + 1 << ". ";
        shapes[i]->draw(cout);
        cout << endl;
    }

    for (size_t i = 0; i < shapes.size(); ++i) {
        shapes[i]->scale(1.1);
        shapes[i]->move(10, -5);
    }

    if (!shapes.empty()) {
        shapes[0]->setColor(0xFF0000);
    }

    cout << "\nAfter scale/move/color-change:" << endl;
    for (size_t i = 0; i < shapes.size(); ++i) {
        cout << setw(2) << i + 1 << ". ";
        shapes[i]->draw(cout);
        cout << endl;
    }

    return 0;
}
