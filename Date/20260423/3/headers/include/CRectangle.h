#ifndef CRECTANGLE_H
#define CRECTANGLE_H

#include "CPoint2D.h"

#include <iosfwd>

class CRectangle {
  private:
    CPoint2D bottom_left_;
    double width_;
    double height_;

  public:
    CRectangle(const CPoint2D &pt, double width, double height);
    CRectangle(double x = 0.0, double y = 0.0, double width = 0.0, double height = 0.0);

    double getDiagonalLength() const;
    double getArea() const;
    double getPerimeter() const;
    const CPoint2D &getBottom_left() const;

    void set_bottom_left(double x, double y);
    void set_width(double new_w);
    void set_height(double new_h);

    double add_area_II(const CRectangle &other) const;

    CRectangle operator+(const CRectangle &other) const;
    CRectangle operator-(double delta) const;
    CRectangle &operator++();
    CRectangle operator++(int);

    friend double add_area_I(const CRectangle &a, const CRectangle &b);
    friend std::ostream &operator<<(std::ostream &os, const CRectangle &rect);
    friend std::istream &operator>>(std::istream &is, CRectangle &rect);
};

#endif
