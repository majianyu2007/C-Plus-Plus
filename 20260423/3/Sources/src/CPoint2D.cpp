#include "../../headers/include/CPoint2D.h"

CPoint2D::CPoint2D(double x, double y) : x_(x), y_(y) {}

double CPoint2D::get_x() const { return x_; }

double CPoint2D::get_y() const { return y_; }

void CPoint2D::set_x(double x) { x_ = x; }

void CPoint2D::set_y(double y) { y_ = y; }
