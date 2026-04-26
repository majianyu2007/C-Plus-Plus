#include "../../headers/include/CRectangle.h"

#include <cmath>

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
