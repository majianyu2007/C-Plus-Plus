#include "../../headers/include/CRectangle.h"

#include <cmath>
#include <iostream>

using std::sqrt;

CRectangle::CRectangle(const CPoint2D &pt, double width, double height)
    : bottom_left_(pt), width_(width), height_(height) {}

CRectangle::CRectangle(double x, double y, double width, double height)
    : bottom_left_(x, y), width_(width), height_(height) {}

double CRectangle::getDiagonalLength() const { return sqrt(width_ * width_ + height_ * height_); }

double CRectangle::getArea() const { return width_ * height_; }

double CRectangle::getPerimeter() const { return 2.0 * (width_ + height_); }

const CPoint2D &CRectangle::getBottom_left() const { return bottom_left_; }

void CRectangle::set_bottom_left(double x, double y) {
    bottom_left_.x_ = x;
    bottom_left_.y_ = y;
}

void CRectangle::set_width(double new_w) { width_ = new_w; }

void CRectangle::set_height(double new_h) { height_ = new_h; }

double CRectangle::add_area_II(const CRectangle &other) const {
    return getArea() + other.getArea();
}

double add_area_I(const CRectangle &a, const CRectangle &b) {
    return a.width_ * a.height_ + b.width_ * b.height_;
}

CRectangle CRectangle::operator+(const CRectangle &other) const {
    return CRectangle(other.bottom_left_, width_ + other.width_, height_ + other.height_);
}

CRectangle CRectangle::operator-(double delta) const {
    return CRectangle(bottom_left_.x_ - delta, bottom_left_.y_ - delta, width_ - delta,
                      height_ - delta);
}

CRectangle &CRectangle::operator++() {
    ++bottom_left_.x_;
    ++bottom_left_.y_;
    ++width_;
    ++height_;
    return *this;
}

CRectangle CRectangle::operator++(int) {
    CRectangle temp = *this;
    ++(*this);
    return temp;
}

std::ostream &operator<<(std::ostream &os, const CRectangle &rect) {
    os << "矩形信息如下：左下角坐标为：（" << rect.bottom_left_.get_x() << "，"
       << rect.bottom_left_.get_y() << "），高为：" << rect.height_ << "，宽为：" << rect.width_
       << "，对角线长为：" << rect.getDiagonalLength() << "，周长为：" << rect.getPerimeter()
       << "，面积为：" << rect.getArea() << "。";
    return os;
}

std::istream &operator>>(std::istream &is, CRectangle &rect) {
    double x = 0.0;
    double y = 0.0;
    double height = 0.0;
    double width = 0.0;

    std::cout << "请依次输入矩形的信息：" << std::endl;
    std::cout << "矩形的左下角坐标(x，y)：";
    is >> x >> y;
    std::cout << "矩形的高H和宽W：";
    is >> height >> width;

    if (is) {
        rect.set_bottom_left(x, y);
        rect.set_height(height);
        rect.set_width(width);
    }
    return is;
}
