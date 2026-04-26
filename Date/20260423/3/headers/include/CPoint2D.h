#ifndef CPOINT2D_H
#define CPOINT2D_H

class CRectangle;

class CPoint2D {
  private:
    double x_;
    double y_;

    friend class CRectangle;

  public:
    CPoint2D(double x = 0.0, double y = 0.0);

    double get_x() const;
    double get_y() const;
    void set_x(double x);
    void set_y(double y);
};

#endif
