#include <iostream>

using namespace std;

class Complex {
  private:
    double real, image;

  public:
    Complex(double real, double image) : real(real), image(image) {}
    Complex(const Complex &other) : real(other.real), image(other.image) {}

    Complex Add(const Complex &other) const {
        return Complex(this->real + other.real, this->image + other.image);
    }

    Complex Sub(const Complex &other) const {
        return Complex(this->real - other.real, this->image - other.image);
    }

    Complex operator+(const Complex &other) const {
        return Complex(this->real + other.real, this->image + other.image);
    }

    Complex operator-(const Complex &other) const {
        return Complex(this->real - other.real, this->image - other.image);
    }

    friend ostream &operator<<(ostream &os, const Complex &other) {
        os << other.real << " + " << other.image << "i";
        return os;
    }

    Complex operator++(int) {
        Complex old(*this);
        ++real;
        ++image;
        return old;
    }
    Complex &operator++() {
        ++real;
        ++image;
        return *this;
    }

    void operator=(const Complex &other) {
        this->real = other.real;
        this->image = other.image;
    }

    bool operator==(const Complex &other) {
        if (this->real == other.real && this->image == other.image)
            return true;
        return false;
    }
};

int main(void) {
    Complex a(3, 4), b(1.5, 2);
    cout << "a = " << a << '\n';
    cout << "b = " << b << '\n';
    cout << "a + b = " << (a + b) << '\n';
    cout << "a - b = " << (a - b) << '\n';
    return 0;
}
